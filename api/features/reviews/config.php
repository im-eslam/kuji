<?php

return [

    'table' => 'reviews',

    'limits' => ['min_message' => 3, 'max_message' => 1000, 'max_name' => 80, 'max_contact' => 120],

    'rate_limit' => [
        'max'    => (int) Env::get('RATE_LIMIT_MAX', '5'),
        'window' => (int) Env::get('RATE_LIMIT_WINDOW', '600'),
    ],

    'admin' => [
        'default_per_page' => 20,
        'max_per_page' => 100,
        'max_delete_batch' => 100,
        'max_search' => 120,
    ],

    'routes' => [
        'POST /review'              => [ReviewsController::class, 'submit'],
        'GET /admin/reviews'        => [ReviewsController::class, 'index'],
        'POST /admin/reviews/delete' => [ReviewsController::class, 'destroy'],
    ],
];
