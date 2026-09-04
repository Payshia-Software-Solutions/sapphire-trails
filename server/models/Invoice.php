<?php

class Invoice
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Generate sequential invoice number (e.g. INV-2026-0001)
     */
    public function generateInvoiceNumber()
    {
        $year = date('Y');
        $stmt = $this->pdo->prepare("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1");
        $stmt->execute(["INV-{$year}-%"]);
        $last = $stmt->fetchColumn();

        if ($last) {
            $parts = explode('-', $last);
            $nextSeq = (int)end($parts) + 1;
        } else {
            $nextSeq = 1;
        }

        return sprintf("INV-%s-%04d", $year, $nextSeq);
    }

    /**
     * Get all invoices with filtering
     */
    public function getAll($filters = [])
    {
        $sql = "
            SELECT i.*, 
                   b.tour_date AS booking_tour_date,
                   b.tour_package_id,
                   (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) AS item_count
            FROM invoices i
            LEFT JOIN bookings b ON i.booking_id = b.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $sql .= " AND i.payment_status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $term = "%" . $filters['search'] . "%";
            $sql .= " AND (i.invoice_number LIKE ? OR i.customer_name LIKE ? OR i.customer_email LIKE ? OR i.tour_title LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY i.created_at DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single invoice by ID with items
     */
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT i.*, 
                   b.tour_date AS booking_tour_date,
                   b.end_date AS booking_end_date,
                   b.guests AS booking_guests,
                   b.message AS booking_message,
                   b.status AS booking_status
            FROM invoices i
            LEFT JOIN bookings b ON i.booking_id = b.id
            WHERE i.id = ?
        ");
        $stmt->execute([$id]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($invoice) {
            $invoice['items'] = $this->getItemsByInvoiceId($invoice['id']);
        }
        return $invoice;
    }

    /**
     * Get single invoice by Invoice Number (e.g. INV-2026-0001)
     */
    public function getByNumber($invoiceNumber)
    {
        $stmt = $this->pdo->prepare("
            SELECT i.*, 
                   b.tour_date AS booking_tour_date,
                   b.end_date AS booking_end_date,
                   b.guests AS booking_guests
            FROM invoices i
            LEFT JOIN bookings b ON i.booking_id = b.id
            WHERE i.invoice_number = ?
        ");
        $stmt->execute([$invoiceNumber]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($invoice) {
            $invoice['items'] = $this->getItemsByInvoiceId($invoice['id']);
        }
        return $invoice;
    }

    /**
     * Get invoice by linked booking ID
     */
    public function getByBookingId($bookingId)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM invoices WHERE booking_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$bookingId]);
        $id = $stmt->fetchColumn();
        return $id ? $this->getById($id) : null;
    }

    /**
     * Get line items for an invoice
     */
    public function getItemsByInvoiceId($invoiceId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC, id ASC");
        $stmt->execute([$invoiceId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new invoice with items
     */
    public function create($data)
    {
        $invoiceNumber = !empty($data['invoice_number']) ? $data['invoice_number'] : $this->generateInvoiceNumber();
        
        $items = $data['items'] ?? [];
        $subtotal = 0.00;
        foreach ($items as $item) {
            $qty = floatval($item['quantity'] ?? 1);
            $unitPrice = floatval($item['unit_price'] ?? 0);
            $subtotal += ($qty * $unitPrice);
        }

        $discount = floatval($data['discount_amount'] ?? 0);
        $tax = floatval($data['tax_amount'] ?? 0);
        $total = max(0, $subtotal - $discount + $tax);
        $amountPaid = floatval($data['amount_paid'] ?? 0);
        $balanceDue = max(0, $total - $amountPaid);

        $paymentStatus = $data['payment_status'] ?? 'unpaid';
        if ($amountPaid >= $total && $total > 0) {
            $paymentStatus = 'paid';
        } elseif ($amountPaid > 0 && $amountPaid < $total) {
            $paymentStatus = 'partially_paid';
        }

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO invoices (
                    invoice_number, booking_id, user_id, customer_name, customer_email,
                    customer_phone, customer_address, tour_title, tour_date, currency,
                    subtotal, discount_amount, tax_amount, total_amount, amount_paid,
                    balance_due, payment_status, payment_method, issue_date, due_date,
                    notes, bank_details, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, NOW(), NOW()
                )
            ");

            $stmt->execute([
                $invoiceNumber,
                $data['booking_id'] ?? null,
                $data['user_id'] ?? null,
                $data['customer_name'],
                $data['customer_email'],
                $data['customer_phone'] ?? null,
                $data['customer_address'] ?? null,
                $data['tour_title'] ?? null,
                $data['tour_date'] ?? null,
                $data['currency'] ?? 'USD',
                $subtotal,
                $discount,
                $tax,
                $total,
                $amountPaid,
                $balanceDue,
                $paymentStatus,
                $data['payment_method'] ?? 'Bank Transfer',
                $data['issue_date'] ?? date('Y-m-d'),
                $data['due_date'] ?? null,
                $data['notes'] ?? null,
                $data['bank_details'] ?? null
            ]);

            $invoiceId = $this->pdo->lastInsertId();

            $itemStmt = $this->pdo->prepare("
                INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            foreach ($items as $idx => $item) {
                $qty = floatval($item['quantity'] ?? 1);
                $unitPrice = floatval($item['unit_price'] ?? 0);
                $lineTotal = $qty * $unitPrice;
                $itemStmt->execute([
                    $invoiceId,
                    $item['description'],
                    $qty,
                    $unitPrice,
                    $lineTotal,
                    $idx + 1
                ]);
            }

            $this->pdo->commit();
            return $invoiceId;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Update an invoice and replace its items
     */
    public function update($id, $data)
    {
        $items = $data['items'] ?? [];
        $subtotal = 0.00;
        foreach ($items as $item) {
            $qty = floatval($item['quantity'] ?? 1);
            $unitPrice = floatval($item['unit_price'] ?? 0);
            $subtotal += ($qty * $unitPrice);
        }

        $discount = floatval($data['discount_amount'] ?? 0);
        $tax = floatval($data['tax_amount'] ?? 0);
        $total = max(0, $subtotal - $discount + $tax);
        $amountPaid = floatval($data['amount_paid'] ?? 0);
        $balanceDue = max(0, $total - $amountPaid);

        $paymentStatus = $data['payment_status'] ?? 'unpaid';
        if ($amountPaid >= $total && $total > 0) {
            $paymentStatus = 'paid';
        } elseif ($amountPaid > 0 && $amountPaid < $total) {
            $paymentStatus = 'partially_paid';
        }

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("
                UPDATE invoices SET
                    customer_name = ?,
                    customer_email = ?,
                    customer_phone = ?,
                    customer_address = ?,
                    tour_title = ?,
                    tour_date = ?,
                    currency = ?,
                    subtotal = ?,
                    discount_amount = ?,
                    tax_amount = ?,
                    total_amount = ?,
                    amount_paid = ?,
                    balance_due = ?,
                    payment_status = ?,
                    payment_method = ?,
                    issue_date = ?,
                    due_date = ?,
                    notes = ?,
                    bank_details = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");

            $stmt->execute([
                $data['customer_name'],
                $data['customer_email'],
                $data['customer_phone'] ?? null,
                $data['customer_address'] ?? null,
                $data['tour_title'] ?? null,
                $data['tour_date'] ?? null,
                $data['currency'] ?? 'USD',
                $subtotal,
                $discount,
                $tax,
                $total,
                $amountPaid,
                $balanceDue,
                $paymentStatus,
                $data['payment_method'] ?? 'Bank Transfer',
                $data['issue_date'] ?? date('Y-m-d'),
                $data['due_date'] ?? null,
                $data['notes'] ?? null,
                $data['bank_details'] ?? null,
                $id
            ]);

            // Re-insert line items
            $this->pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?")->execute([$id]);

            $itemStmt = $this->pdo->prepare("
                INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            foreach ($items as $idx => $item) {
                $qty = floatval($item['quantity'] ?? 1);
                $unitPrice = floatval($item['unit_price'] ?? 0);
                $lineTotal = $qty * $unitPrice;
                $itemStmt->execute([
                    $id,
                    $item['description'],
                    $qty,
                    $unitPrice,
                    $lineTotal,
                    $idx + 1
                ]);
            }

            $this->pdo->commit();
            return true;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Update payment details only
     */
    public function updatePaymentStatus($id, $status, $amountPaid = null, $paymentMethod = null)
    {
        $invoice = $this->getById($id);
        if (!$invoice) return false;

        $total = floatval($invoice['total_amount']);
        $paid = $amountPaid !== null ? floatval($amountPaid) : floatval($invoice['amount_paid']);
        if ($status === 'paid') {
            $paid = $total;
        }
        $balance = max(0, $total - $paid);

        $sql = "UPDATE invoices SET payment_status = ?, amount_paid = ?, balance_due = ?, updated_at = NOW()";
        $params = [$status, $paid, $balance];

        if ($paymentMethod) {
            $sql .= ", payment_method = ?";
            $params[] = $paymentMethod;
        }

        $sql .= " WHERE id = ?";
        $params[] = $id;

        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Auto update tour dates across linked invoices when a booking is rescheduled
     */
    public function updateDatesByBookingId($bookingId, $newTourDate)
    {
        $stmt = $this->pdo->prepare("UPDATE invoices SET tour_date = ?, updated_at = NOW() WHERE booking_id = ?");
        return $stmt->execute([$newTourDate, $bookingId]);
    }

    /**
     * Get default billing & bank account settings
     */
    public function getSettings()
    {
        $stmt = $this->pdo->prepare("SELECT content FROM site_content WHERE section_key = 'billing_settings'");
        $stmt->execute();
        $raw = $stmt->fetchColumn();
        if ($raw) {
            $parsed = json_decode($raw, true);
            if ($parsed) return $parsed;
        }

        return [
            'bank_name' => 'Commercial Bank of Ceylon',
            'account_name' => 'Sapphire Trails (Pvt) Ltd',
            'account_number' => '8001 2345 6789',
            'branch_name' => 'Ratnapura City Branch (Branch Code: 042)',
            'swift_code' => 'CCEYLKLX',
            'additional_instructions' => 'Please include your Invoice Number in the transfer remarks.',
            'default_currency' => 'USD',
            'default_notes' => "Thank you for choosing Sapphire Trails.\n- Full payment is required 48 hours prior to tour departure unless cash on arrival was confirmed.\n- Free rescheduling available up to 72 hours prior to scheduled tour time.\n- All tours include private VIP transportation, licensed gemologist guide, and mining permits.",
        ];
    }

    /**
     * Save default billing & bank account settings
     */
    public function saveSettings($data)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM site_content WHERE section_key = 'billing_settings'");
        $stmt->execute();
        $exists = $stmt->fetchColumn() > 0;

        $json = json_encode($data);
        if ($exists) {
            $stmt = $this->pdo->prepare("UPDATE site_content SET content = ? WHERE section_key = 'billing_settings'");
            return $stmt->execute([$json]);
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO site_content (section_key, content) VALUES ('billing_settings', ?)");
            return $stmt->execute([$json]);
        }
    }

    /**
     * Delete invoice
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM invoices WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
