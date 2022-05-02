const express = require('express');
const router = express.Router();
const Hero = require('../models/heroes');
const multer = require('multer');
const fs = require('fs');


// image upload
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage,
}).single('image');

router.post('/add', upload, (req, res) => {
    const hero = new Hero({
        nickname: req.body.nickname,
        real_name: req.body.real_name,
        origin_description: req.body.origin_description,
        superpowers: req.body.superpowers,
        catch_phrase: req.body.catch_phrase,
        image: req.file.filename,
    });
    hero.save((err) => {
        if (err) {
            res.json({message: err.message, type: 'danger'});
        } else {
            req.session.message = {
                type: 'success',
                message: 'Hero added successfully!'
            };
            res.redirect('/');
        }
    })
});

router.get('/', (req, res) => {
    Hero.find().exec((err, heroes) => {
        if (err) {
            res.json({message: err.message});
        } else {
            res.render('index', {
                title: 'Home page',
                heroes: heroes,
            })
        }
    })
});

router.get('/add', (req, res) => {
    res.render('add_heroes', {title: 'Add Heroes'});
});

router.get('/view/:id', (req, res) => {
    let id = req.params.id;
    Hero.findById(id, (err, hero) => {
        if (err) {
            res.redirect('/');
        } else {
            if (hero == null) {
                res.redirect('/');
            } else {
                res.render('hero_page', {
                    title: 'View Hero',
                    hero: hero,
                });
            }
        }
    });
});

router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    Hero.findById(id, (err, hero) => {
        if (err) {
            res.redirect('/');
        } else {
            if (hero == null) {
                res.redirect('/');
            } else {
                res.render('edit_heroes', {
                    title: 'Edit Hero',
                    hero: hero,
                });
            }
        }
    });
});

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    Hero.findByIdAndUpdate(id, {
        nickname: req.body.nickname,
        real_name: req.body.real_name,
        origin_description: req.body.origin_description,
        superpowers: req.body.superpowers,
        catch_phrase: req.body.catch_phrase,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({message: err.message, type: 'danger'})
        } else {
            req.session.message = {
                type: 'success',
                message: 'Hero updated successfully'
            };
            res.redirect('/');
        }
    })

});

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    Hero.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image)
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({message: err.message});
        } else {
            req.session.message = {
                type: 'success',
                message: 'Hero deleted successfully!'
            };
            res.redirect('/');
        }
    })
})

module.exports = router;