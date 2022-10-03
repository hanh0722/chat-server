import express from 'express';
import mongoose from 'mongoose';
import { ExpressPeerServer } from 'peer';
import { corsController } from './config/cors';
import { connection } from './config/db';
import { init } from './config/socket';
import { PATHS } from './constants/path';

const app = express();

const server = app.listen(3000);

const peerServer = ExpressPeerServer(server, {
  path: PATHS.PEER_SERVER
});

init(server);

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(express.static(__dirname));

app.use(corsController);

app.use(PATHS.PEER_SERVER, peerServer);

connection().then(response => {});



