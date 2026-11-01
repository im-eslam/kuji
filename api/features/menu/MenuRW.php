<?php

final class MenuRW
{
    public function __construct(private string $path)
    {
    }

    public function read(): string
    {
        if (!is_file($this->path) || !is_readable($this->path)) {
            throw new RuntimeException('Menu file is missing or unreadable.');
        }

        $json = file_get_contents($this->path);
        if ($json === false) {
            throw new RuntimeException('Menu file could not be read.');
        }

        try {
            json_decode($json, false, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $error) {
            throw new RuntimeException(
                'Menu file contains invalid JSON: ' . $error->getMessage(),
                0,
                $error
            );
        }

        return $json;
    }
}
