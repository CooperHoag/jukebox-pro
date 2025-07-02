import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import requireUser from "../middleware/requireUser.js";
router.use(requireUser);

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const playlists = await getPlaylists(req.user.id);
      res.send(playlists);
    } catch (err) {
      next(err);
    }
  })
  .post(requireUser, async (req, res, next) => {
    try {
      const { name, description } = req.body;
  
      if (!name || !description) {
        return res.status(400).send("Request body requires: name, description");
      }
  
      const playlist = await createPlaylist(name, description, req.user.id);
      res.status(201).send(playlist);
    } catch (err) {
      next(err);
    }
  });  

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  req.playlist = playlist;
  next();
});

router.route("/:id").get((req, res) => {
  res.send(req.playlist);
});

router
  .route("/:id/tracks")
  .get(async (req, res) => {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  })
  .post(async (req, res) => {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
    res.status(201).send(playlistTrack);
  });
