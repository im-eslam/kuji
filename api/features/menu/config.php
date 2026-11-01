<?php

return [
    'file' => __DIR__ . '/../../storage/menu.json',

    'routes' => [
        'GET /menu' => [MenuController::class, 'index'],
    ],
];
