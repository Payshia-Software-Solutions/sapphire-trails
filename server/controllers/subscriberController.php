<?php
require_once __DIR__ . '/../models/Subscriber.php';
require_once __DIR__ . '/../models/Contact.php';
require_once __DIR__ . '/../lib/Mailer.php';

class SubscriberController
{
    private $pdo;
    private $model;
    private $contactModel;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new Subscriber($pdo);
        $this->contactModel = new Contact($pdo);
        $this->mailer = new Mailer($pdo);
    }

    /**
     * List all subscribers (Admin only)
     */
    public function getAll()
    {
        $subscribers = $this->model->getAll();
        echo json_encode($subscribers);
    }

    /**
     * Get single subscriber by ID
     */
    public function getById($id)
    {
        $subscriber = $this->model->getById($id);
        if ($subscriber) {
            echo json_encode($subscriber);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Subscriber not found']);
        }
    }

    /**
     * Create or reactivate subscriber (Public & Admin)
     */
    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($data['email'] ?? '');
        $source = trim($data['source'] ?? '2026 Gem Buyer Guide Download');

        if (empty($email)) {
            http_response_code(422);
            echo json_encode(['error' => 'Email address is required']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid email address format']);
            return;
        }

        try {
            // 1. Save to dedicated subscribers table
            $subscriber = $this->model->createOrUpdate($email, $source);

            // 2. Also log in contact table for lead audit trail and trigger mailer
            try {
                $contactPayload = [
                    'name' => 'Guide Subscriber',
                    'email' => $email,
                    'phone' => '',
                    'tour_interest' => 'Guide Download (Lead Magnet)',
                    'subject' => 'Guide Download: ' . $source,
                    'message' => "Subscriber requested {$source} from Sapphire Trails website.",
                    'status' => 'read'
                ];
                $contactId = $this->contactModel->create($contactPayload);
                $contactRecord = $this->contactModel->getById($contactId);
                if ($contactRecord) {
                    $this->mailer->sendContactEmails($contactRecord);
                }
            } catch (\Exception $mailEx) {
                error_log("Subscriber contact/mail dispatch notice: " . $mailEx->getMessage());
            }

            http_response_code(201);
            echo json_encode([
                'message' => 'Subscribed successfully and guide dispatched.',
                'subscriber' => $subscriber
            ]);

        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Update subscriber status (active / unsubscribed)
     */
    public function updateStatus($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Subscriber not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $data['status'] ?? 'active';

        try {
            $this->model->updateStatus($id, $status);
            echo json_encode($this->model->getById($id));
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete subscriber by ID
     */
    public function delete($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Subscriber not found']);
            return;
        }

        $this->model->delete($id);
        http_response_code(200);
        echo json_encode(['message' => 'Subscriber deleted successfully', 'id' => (int)$id]);
    }

    /**
     * Mass email broadcast to active subscribers
     */
    public function broadcast()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');
        $preheader = trim($data['preheader'] ?? '');

        if (empty($subject) || empty($message)) {
            http_response_code(422);
            echo json_encode(['error' => 'Subject and message body are required']);
            return;
        }

        $activeSubscribers = $this->model->getActiveSubscribers();
        $recipientCount = count($activeSubscribers);

        if ($recipientCount === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'No active subscribers found to broadcast']);
            return;
        }

        $badge = '<span style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.06em;">Exclusive Update &bull; Sapphire Trails</span>';
        
        $innerHtml = '
            <div style="font-size: 15px; color: #334155; line-height: 1.75; margin-bottom: 24px;">
                ' . nl2br(htmlspecialchars($message)) . '
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; text-align: center;">
                <p style="margin: 0;">You received this update because you are subscribed to gem expedition guides at <a href="https://sapphiretrails.lk" style="color: #0B1E38; font-weight: 600; text-decoration: none;">sapphiretrails.lk</a>.</p>
            </div>
        ';

        $actionBtn = '
            <a href="https://sapphiretrails.lk/tours" style="display: inline-block; background-color: #0B1E38; color: #FFFFFF; text-decoration: none; padding: 13px 30px; font-size: 14px; font-weight: 600; border-radius: 9999px; letter-spacing: 0.03em;">
                Explore Gem Expeditions &rarr;
            </a>
        ';

        $formattedBody = $this->mailer->wrapEmailTheme(
            $badge,
            htmlspecialchars($subject),
            $innerHtml,
            'NEWSLETTER',
            $actionBtn
        );

        foreach ($activeSubscribers as $sub) {
            try {
                $res = $this->mailer->send($sub['email'], $subject, $formattedBody, 'newsletter_broadcast');
                if ($res['success']) {
                    $successCount++;
                }
            } catch (\Exception $e) {
                error_log("Broadcast error for {$sub['email']}: " . $e->getMessage());
            }
        }

        echo json_encode([
            'message' => "Broadcast dispatched to {$successCount} of {$recipientCount} subscribers.",
            'recipientCount' => $recipientCount,
            'successCount' => $successCount,
            'subject' => $subject,
            'sentAt' => date('Y-m-d H:i:s')
        ]);
    }
}
