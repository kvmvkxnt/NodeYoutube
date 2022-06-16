import { ValidationError, notFoundError, InternalServerError, ForbiddenError } from '../utils/errors.js';
import { read, write } from '../utils/model.js';
import path from 'path';

function GET (req, res, next) {
  try {
    let videos = read('videos');
    let users = read('users');
    let { userId, query } = req.query;

    if (req.url.split('/')[1] == 'admin') userId = req.userId;

    let filtered = videos.filter(video => {
      let byUserId = userId ? video.userId == Number(userId) : true;
      let byQuery = query ? video.title.match(new RegExp(query, 'gi')) : true;
      return byUserId && byQuery;
    });

    filtered = filtered.map(video => {
      video.user = users.find(user => user.userId == video.userId);
      delete video.user.password;
      delete video.userId;
      return video;
    });

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: filtered
    });

  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

function POST (req, res, next) {
  try {
    let users = read('users');
    let videos = read('videos');
    let { title } = req.body;

    if (!req.files || !title) {
      return next( new ValidationError(400, req.files ? 'title required' : 'video required'));
    }

    let { video } = req.files;

    if (!video.mimetype.includes('video') || video.size > 1024 * 1024 * 100) {
      return next( new ValidationError(400, video.mimetype.includes('video') ? 'video size is too big' : 'invalid video format'));
    }

    let fileName = `${Date.now()}_${title.replace(/\s/g, '')}.${video.name.split('.').at(-1)}`;
    video.mv(path.join(process.cwd(), 'uploads', fileName));

    req.body.videoId = videos.length ? videos.at(-1).videoId + 1 : 1;
    req.body.size = video.size;
    req.body.link = fileName;
    req.body.date = new Date();
    req.body.mimetype = video.mimetype;
    req.body.userId = req.userId;

    videos.push(req.body);
    write('videos', videos);

    req.body.user = users.find(user => user.userId == req.userId);
    delete req.body.user.password;
    delete req.body.userId;

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: req.body
    });

  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

function PUT (req, res, next) {
  try {
    let users = read('users');
    let videos = read('videos');
    let { videoId } = req.params;
    let { title } = req.body;
    let video = videos.find(video => video.videoId == videoId && video.userId == req.userId);
    
    if (!video) {
      return next( new notFoundError(404, 'no video found') );
    }

    if (video.title == title || title.length < 1) {
      return next( new ForbiddenError(403, !title.length ? 'new title is too short' : 'new title is equal to previous title') );
    }

    video.title = title;
    write('videos', videos);

    video.user = users.find(user => user.userId == video.userId);
    delete video.user.password;
    delete video.userId;

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: video
    });
        
  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

function DELETE (req, res, next) {
  try {
    let users = read('users');
    let videos = read('videos');
    let { videoId } = req.params;
    let video = videos.find(video => video.videoId == videoId && video.userId == req.userId);

    if (!video) {
      return next( new notFoundError(404, 'no video found') );
    }

    let [deleted] = videos.splice(videos.findIndex(video => video.videoId == videoId && video.userId == req.userId), 1);
    write('videos', videos);

    deleted.user = users.find(user => user.userId == deleted.userId);
    delete deleted.userId;
    delete deleted.user.password;
    
    res.status(200).json({
      status: 200,
      message: 'ok',
      data: deleted
    });

  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

function DOWNLOAD (req, res, next) {
  try {

    let { fileName } = req.params;

    res.download(path.join(process.cwd(), 'uploads', fileName));

  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

export default {
  GET,
  POST,
  PUT,
  DELETE,
  DOWNLOAD
}
