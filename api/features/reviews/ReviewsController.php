<?php

class ReviewsController extends Controller
{
    protected const FEATURE = 'reviews';

    public function submit(): void
    {
        $cfg    = $this->settings();
        $limits = $cfg['limits'];

        RateLimit::check('review', $cfg['rate_limit']['max'], $cfg['rate_limit']['window']);

        $input = Http::input();

        if (Http::text($input, 'website') !== '') {
            Http::json(['ok' => true]);
        }

        $message = Http::text($input, 'message');
        $name    = Http::text($input, 'name');
        $contact = Http::text($input, 'contact');

        if (
            mb_strlen($message) < $limits['min_message'] ||
            mb_strlen($message) > $limits['max_message'] ||
            mb_strlen($name)    > $limits['max_name'] ||
            mb_strlen($contact) > $limits['max_contact']
        ) {
            Http::fail(422, 'Invalid input', 'INVALID_INPUT');
        }

        $this->db()
            ->prepare("INSERT INTO {$cfg['table']} (name, contact, message) VALUES (?, ?, ?)")
            ->execute([$name, $contact, $message]);

        Http::json(['ok' => true], 201);
    }

    public function index(): void
    {
        Auth::requireAdmin($this->config);

        $cfg   = $this->settings();
        $paging = $cfg['admin'];
        $table = $cfg['table'];

        $page    = max(1, min(100000, (int) ($_GET['page'] ?? 1)));
        $perPage = (int) ($_GET['per_page'] ?? $paging['default_per_page']);
        $perPage = max(1, min($paging['max_per_page'], $perPage ?: $paging['default_per_page']));
        $offset  = ($page - 1) * $perPage; // both values are validated integers

        $pdo   = $this->db();
        $total = (int) $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        $rows  = $pdo->query(
            "SELECT id, name, contact, message, created_at FROM $table ORDER BY id DESC LIMIT $perPage OFFSET $offset"
        )->fetchAll();

        foreach ($rows as &$row) {
            $row['id'] = (int) $row['id'];
        }
        unset($row);

        Http::json([
            'ok'          => true,
            'items'       => $rows,
            'page'        => $page,
            'per_page'    => $perPage,
            'total'       => $total,
            'total_pages' => max(1, (int) ceil($total / $perPage)),
        ]);
    }

    public function destroy(): void
    {
        Auth::requireAdmin($this->config);

        $cfg = $this->settings();
        $ids = Http::input()['ids'] ?? null;

        if (!is_array($ids) || $ids === [] || count($ids) > $cfg['admin']['max_delete_batch']) {
            Http::fail(422, 'Invalid input', 'INVALID_INPUT');
        }

        $clean = [];
        foreach ($ids as $id) {
            if (!is_int($id) || $id < 1) {
                Http::fail(422, 'Invalid input', 'INVALID_INPUT');
            }
            $clean[$id] = $id;
        }
        $clean = array_values($clean);

        $marks = implode(',', array_fill(0, count($clean), '?'));
        $stmt  = $this->db()->prepare("DELETE FROM {$cfg['table']} WHERE id IN ($marks)");
        foreach ($clean as $i => $id) {
            $stmt->bindValue($i + 1, $id, PDO::PARAM_INT);
        }
        $stmt->execute();

        Http::json(['ok' => true, 'deleted' => $stmt->rowCount()]);
    }
}
