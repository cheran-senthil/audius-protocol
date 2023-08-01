<hr />

### createPlaylist

#### createPlaylist(`requestParameters`, `writeOptions?`)

Create a playlist from existing tracks

Example:

```typescript
import fs from "fs";

const coverArtBuffer = fs.readFileSync("path/to/cover-art.png");

const { playlistId } = await audiusSdk.playlists.createPlaylist({
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: "coverArt",
  },
  metadata: {
    description: "The best tracks for Fido.",
    playlistName: "Music for Dogs",
    isPrivate: true,
  },
  onProgress: (progress) => {
    console.log("Progress: ", progress / 100);
  },
  trackIds: ["yyNwXq7", "KVx2xpO", "YJ7Wxpm"],
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name           | Type                                                                   | Default value | Required? |
| :------------- | :--------------------------------------------------------------------- | :------------ | :-------- |
| `coverArtFile` | `File`                                                                 | N/A           | No        |
| `metadata`     | `{ playlistName: string; description?: string; isPrivate?: boolean; }` | N/A           | Yes       |
| `onProgress`   | `(progress: number) => void`                                           | `undefined`   | No        |
| `trackIds`     | `Array<string>`                                                        | `[]`          | Yes       |
| `userId`       | `string`                                                               | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the playlist ID (`playlistId`), as well as the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; playlistId: string }>`

---

### uploadPlaylist

#### uploadPlaylist(`requestParameters`, `writeOptions?`)

Upload the specified tracks and combine them into a new playlist.

A playlist is a living thing that can change and grow over time. Playlists can contain a user's own tracks, as well as tracks uploaded by others.

See [uploadAlbum](developers/write-albums) to upload an album instead of a playlist.

Example:

```typescript
import { Mood, Genre } from "@audius/sdk";
import fs from "fs";

const coverArtBuffer = fs.readFileSync("path/to/cover-art.png");
const trackBuffer1 = fs.readFileSync("path/to/track1.mp3");
const trackBuffer2 = fs.readFileSync("path/to/track2.mp3");
const trackBuffer3 = fs.readFileSync("path/to/track3.mp3");

const { playlistId } = await audiusSdk.playlists.uploadPlaylist({
  userId: "7eP5n",
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: "coverArt",
  },
  metadata: {
    playlistName: "Songs of the Forest",
    description: "A playlist full of forest energy.",
    genre: Genre.ELECTRONIC,
    mood: Mood.TENDER,
    tags: "nature",
  },
  trackMetadatas: [
    {
      title: "Oak",
    },
    {
      title: "Sycamore",
    },
    {
      title: "Bush",
    },
  ],
  trackFiles: [
    {
      buffer: Buffer.from(trackBuffer1),
      name: "OakTrmp3",
    },
    {
      buffer: Buffer.from(trackBuffer2),
      name: "SycamoreTrmp3",
    },
    {
      buffer: Buffer.from(trackBuffer3),
      name: "BushTrmp3",
    },
  ],
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name             | Type                                                                                                                                                                                     | Default value | Required? | Notes                                                                                                                                                     |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coverArtFile`   | `File`                                                                                                                                                                                   | N/A           | Yes       |                                                                                                                                                           |
| `metadata`       | <code>{ genre: Genre; playlistName: string; description?: string; isrc?: string; iswc?: string; license?: string; mood?: Mood; releaseDate?: Date; tags?: string; upc?: string; }</code> | N/A           | Yes       |                                                                                                                                                           |
| `onProgress`     | `(progress: number) => void`                                                                                                                                                             | `undefined`   | No        |                                                                                                                                                           |
| `trackFiles`     | `Array<File>`                                                                                                                                                                            | `[]`          | No        |                                                                                                                                                           |
| `trackMetadatas` | [`UploadTrackMetadata`](/developers/UploadTrackMetadata)`[]`                                                                                                                             | `[]`          | No        | See [here](/developers/UploadTrackMetadata) for full `UploadTrackMetadata` interface. Mood, genre, and tags are inherited from the playlist if not given. |
| `userId`         | `string`                                                                                                                                                                                 | N/A           | Yes       |                                                                                                                                                           |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the new playlist's ID (`playlistId`), as well as the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; playlistId: string } >`

---

### addTrackToPlaylist

#### addTrackToPlaylist(`requestParameters`, `writeOptions?`)

Add a single track to the end of a playlist. For more control, use [updatePlaylist](#updateplaylist).

Example:

```typescript

await audiusSdk.playlists.addTrackToPlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
  trackId: 'yyNwXq7'
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |
| `trackId`    | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; playlistId: string } >`

---

### removeTrackFromPlaylist

#### removeTrackFromPlaylist(`requestParameters`, `writeOptions?`)

Removes a single track at the given index of playlist. For more control, use [updatePlaylist](#updatePlaylist).

Example:

```typescript
await audiusSdk.playlists.removeTrackFromPlaylist({
  playlistId: 'x5pJ3Az'
  trackIndex: 2,
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |
| `trackId`    | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### updatePlaylist

#### updatePlaylist(`requestParameters`, `writeOptions?`)

Update a playlist. If cover art or any metadata fields are not provided, their values will be kept the same as before.

Example:

```typescript
import fs from "fs";

const coverArtBuffer = fs.readFileSync("path/to/updated-cover-art.png");

const { playlistId } = await audiusSdk.playlists.updatePlaylist({
  playlistId: "x5pJ3Az",
  coverArtFile: {
    buffer: Buffer.from(coverArtBuffer),
    name: "coverArt",
  },
  metadata: {
    description:
      "The best tracks for Fido. Updated with new cover art and tracks!!!",
    playlistContents: [
      {
        timestamp: 1687328748, // The date/time the track was added to the playlist
        trackId: "yyNwXq7",
      },
      { timestamp: Date.now(), trackId: "lvG4Nyl" },
      { timestamp: 1687328748, trackId: "KVx2xpO" },
      { timestamp: Date.now(), trackId: "JZAQx5z" },
    ],
  },
  onProgress: (progress) => {
    console.log("Progress: ", progress / 100);
  },
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name           | Type                                                                                                                                                                                                                                   | Default value | Required? |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :-------- |
| `playlistId`   | `string`                                                                                                                                                                                                                               | N/A           | Yes       |
| `userId`       | `string`                                                                                                                                                                                                                               | N/A           | Yes       |
| `coverArtFile` | `string`                                                                                                                                                                                                                               | `undefined`   | No        |
| `metadata`     | <code>{ playlistName?: string; description?: string; playlistContents?: Array<{trackId: string, time: number}>, isrc?: string; iswc?: string; license?: string; mood?: Mood; releaseDate?: Date; tags?: string; upc?: string; }</code> | N/A           | Yes       |
| `onProgress`   | `(progress: number) => void`                                                                                                                                                                                                           | `undefined`   | No        |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### deletePlaylist

#### deletePlaylist(`requestParameters`, `writeOptions?`)

Delete a playlist

Example:

```typescript
await audiusSdk.playlists.deletePlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### favoritePlaylist

#### favoritePlaylist(`requestParameters`, `writeOptions?`)

Favorites a playlist

Example:

```typescript
await audiusSdk.playlists.favoritePlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type                                     | Default value                          | Required? | Notes                                                                   |
| :----------- | :--------------------------------------- | :------------------------------------- | :-------- | ----------------------------------------------------------------------- |
| `playlistId` | `string`                                 | N/A                                    | Yes       |                                                                         |
| `userId`     | `string`                                 | N/A                                    | Yes       |                                                                         |
| `metadata`   | <code>{ isSaveOfRepost: boolean }</code> | <code>{ isSaveOfRepost: false }</code> | No        | Set `isSaveOfRepost` to true if you are favoriting a reposted playlist. |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### unfavoritePlaylist

#### unfavoritePlaylist(`requestParameters`, `writeOptions?`)

Unfavorite a playlist

Example:

```typescript
await audiusSdk.playlists.unfavoritePlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### repostPlaylist

#### repostPlaylist(`requestParameters`, `writeOptions?`)

Repost a playlist

Example:

```typescript
await audiusSdk.playlists.repostPlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type                                     | Default value                          | Required? | Notes                                                                    |
| :----------- | :--------------------------------------- | :------------------------------------- | :-------- | ------------------------------------------------------------------------ |
| `playlistId` | `string`                                 | N/A                                    | Yes       |                                                                          |
| `userId`     | `string`                                 | N/A                                    | Yes       |                                                                          |
| `metadata`   | <code>{isRepostOfRepost: boolean}</code> | <code>{ isSaveOfRepost: false }</code> | No        | Set `isRepostOfRepost` to true if you are reposting a reposted playlist. |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### unrepostPlaylist

#### unrepostPlaylist(`requestParameters`, `writeOptions?`)

Unrepost a playlist

Example:

```typescript
await audiusSdk.playlists.unrepostPlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---

### publishPlaylist

#### publishPlaylist(`requestParameters`, `writeOptions?`)

Changes a playlist from hidden (private) to public.

Example:

```typescript
await audiusSdk.playlists.publishPlaylist({
  playlistId: 'x5pJ3Az'
  userId: "7eP5n",
});
```

#### `requestParameters` parameters

Create an object with the following fields and pass it as the first argument, as shown in the example above.

| Name         | Type     | Default value | Required? |
| :----------- | :------- | :------------ | :-------- |
| `playlistId` | `string` | N/A           | Yes       |
| `userId`     | `string` | N/A           | Yes       |

#### `writeOptions` parameters (advanced)

You can pass an optional [`writeOptions`](/developers/writeOptions) object as the second argument.

#### Returns

Returns a `Promise` containing an object with the block hash (`blockHash`) and block number (`blockNumber`) for the transaction.

Return type:

`Promise<{ blockHash: string; blockNumber: number; }>`

---