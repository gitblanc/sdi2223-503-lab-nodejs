const {ObjectId} = require("mongodb");
module.exports = function (app, commentsRepository) {
    app.post('/comments/:song_id', function (req, res) {
        let comment = {
            author: req.session.user, text: req.body.text, song_id: ObjectId(req.params.song_id)
        }
        if(req.session.user != null) {
            commentsRepository.insertComment(comment, function (commentId) {
                if (commentId == null) {
                    res.send("Error al insertar el comentario");
                } else {
                    res.send("Agregado el comentario con ID: " + commentId);
                }
            })
        }else{
            res.send("Error al insertar el comentario, usuario no autenticado");
        }
    });
}