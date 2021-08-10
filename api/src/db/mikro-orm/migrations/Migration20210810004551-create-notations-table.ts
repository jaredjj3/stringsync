import { Migration } from '@mikro-orm/migrations';

export class Migration20210810004551 extends Migration {
  async up(): Promise<void> {
    await this.execute(`
CREATE TABLE notations (
  id TEXT PRIMARY KEY,
  cursor SERIAL UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  song_name TEXT,
  artist_name TEXT,
  dead_time_ms integer DEFAULT 0 NOT NULL,
  duration_ms integer DEFAULT 0 NOT NULL,
  private BOOLEAN default true NOT NULL,
  transcriber_id TEXT REFERENCES users (id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  video_url TEXT,
  music_xml_url TEXT
);

CREATE TRIGGER trigger_generate_notation_id BEFORE INSERT ON notations FOR EACH ROW EXECUTE PROCEDURE unique_short_id();
CREATE INDEX index_notations_on_transcriber_id ON notations (transcriber_id);
CREATE INDEX index_notations_on_private ON notations (private);
CREATE INDEX index_notations_on_cursor ON notations (cursor);
CREATE INDEX trgm_index_notations_on_song_name ON notations USING GIN (song_name gin_trgm_ops);
CREATE INDEX trgm_index_notations_on_artist_name ON notations USING GIN (artist_name gin_trgm_ops);`);
  }

  async down(): Promise<void> {
    await this.execute(`
DROP TABLE notations;

DROP TRIGGER trigger_generate_notation_id ON notations;
DROP INDEX index_notations_on_transcriber_id;
DROP INDEX index_notations_on_cursor;
DROP INDEX index_notations_on_private;
DROP INDEX trgm_index_notations_on_song_name;
DROP INDEX trgm_index_notations_on_song_name;`);
  }
}
