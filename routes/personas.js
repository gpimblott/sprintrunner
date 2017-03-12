var fs = require('fs');
var express = require('express');
var router = express.Router();
var utils = require('../utils/storyHelper');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, limits: { fileSize:10000} });
var personaDao = require('../dao/persona');
var sanitizer = require('sanitize-html');

router.get('/add', function (req, res, next) {

  res.render('personas/add-persona' );

});

router.get('/image/:id', function (req, res, next) {
  var id = decodeURI(req.params[ "id" ]);
  personaDao.getAvatar(id, function (data, error) {
    if (data === null) {
      var img = fs.readFileSync('./public/images/default-avatar.jpg');
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');

    } else {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.write(Buffer.from(data, 'base64'));
      res.end();
    }
  });

});

router.get('/edit/:id', function (req, res, next) {
  var personaId = decodeURI(req.params[ "id" ]);

  personaDao.getPersona(personaId, function (persona, error) {
    res.render('personas/update-persona', { persona: persona });
  })

});

router.get('/delete/:id', function (req, res, next) {
  var personaId = decodeURI(req.params[ "id" ]);

  personaDao.deletePersona(personaId, function (persona, error) {
    res.redirect('/personas');
  })

});


router.post('/:personaId', upload.single('avatar'), function (req, res, next) {
  var id = decodeURI(req.params[ "personaId" ]);;
  var name = sanitizer(req.body.name);
  var details = sanitizer(req.body.details);
  var goal = sanitizer(req.body.goal);
  var avatarData = null;

  if (req.file) {
    avatarData = req.file.buffer;
  }

  personaDao.update(id, name, details, goal, avatarData, function (results, error) {
    res.redirect('/personas');
  });
});

router.post('/', upload.single('avatar'), function (req, res, next) {

  var name = sanitizer(req.body.name);
  var details = sanitizer(req.body.details);
  var goal = sanitizer(req.body.goal);
  var avatarData = null;

  if (req.file) {
    avatarData = req.file.buffer;
  }

  personaDao.add(name, details, goal, avatarData, function (results, error) {
    res.redirect('/personas');
  });
});



router.get('/', function (req, res, next) {

  personaDao.getAllPersonas(function (error, personas) {
    res.render('personas/list-personas', { personas: personas });
  });

});

router.get('/:id', function (req, res, next) {
  var personaId = decodeURI(req.params[ "id" ]);

  personaDao.getPersona(personaId, function (persona, error) {
    res.render('personas/show-persona', { persona: persona });
  })

});

module.exports = router;
