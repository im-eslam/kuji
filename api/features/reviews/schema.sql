CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(80)   NOT NULL DEFAULT '',
    contact    VARCHAR(120)  NOT NULL DEFAULT '',
    message    VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at_id
    ON reviews (created_at DESC, id DESC);
