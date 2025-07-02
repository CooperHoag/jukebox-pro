import db from "#db/client";
import { faker } from "@faker-js/faker";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "./queries/users.js";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const user1 = await createUser("alice", "password1");
  const user2 = await createUser("bob", "password2");

  for (let i = 1; i <= 20; i++) {
    await createTrack(faker.music.songName(), faker.number.int({ min: 10000, max: 300000 }));
  }

  const playlistIds = [];

  for (let i = 1; i <= 4; i++) {
    const owner = i <= 2 ? user1 : user2;
    const playlist = await createPlaylist(
      faker.word.words({ count: 2 }),
      faker.lorem.sentence(),
      owner.id
    );
    playlistIds.push(playlist.id);
  }

  for (let i = 0; i < playlistIds.length; i++) {
    const playlistId = playlistIds[i];
    const startTrack = i * 5 + 1;

    for (let j = 0; j < 5; j++) {
      await createPlaylistTrack(playlistId, startTrack + j);
    }
  }
}
