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

        $cfg = $this->settings();
        $paging = $cfg['admin'];
        $table = $cfg['table'];

        $rawSearch = $_GET['q'] ?? '';
        if (!is_string($rawSearch)) {
            Http::fail(422, 'Invalid search query', 'INVALID_INPUT');
        }
        $search = trim($rawSearch);
        if (mb_strlen($search) > $paging['max_search']) {
            Http::fail(422, 'Search query is too long', 'INVALID_INPUT');
        }

        $rawPage = $_GET['page'] ?? '1';
        $rawPerPage = $_GET['per_page'] ?? (string) $paging['default_per_page'];
        if (
            !is_string($rawPage) || !ctype_digit($rawPage) ||
            !is_string($rawPerPage) || !ctype_digit($rawPerPage)
        ) {
            Http::fail(422, 'Invalid pagination parameters', 'INVALID_INPUT');
        }

        $page = max(1, min(100000, (int) $rawPage));
        $perPage = max(1, min($paging['max_per_page'], (int) $rawPerPage));

        $where = '';
        $searchParams = [];
        if ($search !== '') {
            $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);
            $pattern = '%' . $escaped . '%';
            $where = " WHERE name ILIKE ? ESCAPE '!' OR contact ILIKE ? ESCAPE '!' OR message ILIKE ? ESCAPE '!'";
            $searchParams = [$pattern, $pattern, $pattern];
        }

        $pdo = $this->db();
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM {$table}{$where}");
        $countStmt->execute($searchParams);
        $total = (int) $countStmt->fetchColumn();

        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min($page, $totalPages);
        $offset = ($page - 1) * $perPage;

        $stmt = $pdo->prepare(
            "SELECT id, name, contact, message, created_at
             FROM {$table}{$where}
             ORDER BY created_at DESC, id DESC
             LIMIT ? OFFSET ?"
        );
        foreach ($searchParams as $index => $value) {
            $stmt->bindValue($index + 1, $value, PDO::PARAM_STR);
        }
        $stmt->bindValue(count($searchParams) + 1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(count($searchParams) + 2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();
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
            'total_pages' => $totalPages,
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
