import { read, write } from '../utils/model.js';
import { InternalServerError, AuthorizationError, notFoundError } from '../utils/errors.js';
import sha256 from 'sha256';
import jwt from '../utils/jwt.js';
import path from 'path';

function GET (req, res, next) {
  try {
    let users = read('users');
    let { userId } = req.params;

    if (userId) {
      let [user] = users.filter(user => user.userId == userId);

      if (!user) {
        return next( new notFoundError(404, 'user not found') );
      }

      delete user.password;
      return res.status(200).json({
        status: 200,
        message: 'ok',
        data: user
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: users.filter(user => delete user.password)
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function LOGIN (req, res, next) {
  try {
    let { username, password } = req.body;
    let users = read('users');

    let user = users.find(user => user.username == username && user.password == sha256(password));

    if (!user) {
      return next( new AuthorizationError(401, 'wrong username or password' ))
    }

    delete user.password;

    res.cookie('token', jwt.sign({userId: user.userId}));

    res.status(200).json({
      status: 200,
      message: 'ok',
      token: jwt.sign({userId: user.userId}),
      data: user
    });

  } catch (e) {
    return next( new InternalServerError(500, e.message ));
  }
}

function REGISTER (req, res, next) {
  try {
    let users = read('users');
    let { username, password } = req.body;
    let user = users.find(user => user.username == username);

    if (user) {
      return next( new AuthorizationError(401, 'this user already exists') )
    }

    req.body.userId = users.length ? users.at(-1).userId + 1 : 1;
    req.body.password = sha256(password);

    if (req.files) {
      let fileName = `${Date.now()}_${req.body.username.replace(/\s/g, '')}_avatar.${req.files.avatar.name.split('.').at(-1)}`;
      req.files.avatar.mv(path.join(process.cwd(), 'uploads', fileName));
      req.body.avatar = fileName;
    } else {
      req.body.avatar = 'stock.jpg';
    }

    users.push(req.body);
    write('users', users);

    delete req.body.password;
    res.cookie('token', jwt.sign({userId: req.body.userId}));
    
    res.status(201).json({
      status: 201,
      message: 'ok',
      token: jwt.sign({userId: req.body.userId}),
      data: req.body
    });

  } catch (e) {
    return next( new InternalServerError(500, e.message) );
  }
}

export default {
  GET,
  LOGIN,
  REGISTER
}
