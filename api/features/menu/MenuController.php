<?php

final class MenuController extends Controller
{
    protected const FEATURE = 'menu';

    public function index(): void
    {
        try {
            $json = (new MenuRW($this->settings()['file']))->read();
        } catch (RuntimeException $error) {
            error_log('[menu] read failed: ' . $error->getMessage());
            Http::fail(500, 'Menu is temporarily unavailable.', 'MENU_UNAVAILABLE');
        }

        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');

        echo $json;
        exit;
    }
}