module.exports = function (app, twig) {
    app.get("/authors/add", function (rq, res) {
        res.render("./authors/add.twig");
    });

    app.post("/authors/add", function (req, res) {
        let name = req.body.name;
        let group = req.body.group;
        let role = req.body.role;
        if (name == '')
            name = "Nombre no enviado en la petición";
        if (group == '')
            group = "Grupo no enviado en la petición";
        if (role == '')
            role = "Rol no eviado en la petición";
        let response = "Autor agregado: " + name + "<br>" + " grupo: " + group + "<br>" + "rol: " + role;
        res.send(response);
    });

    app.get("/authors", function (rq, res) {
        let autores = [{
            "nombre": "Eduardo Blanco",
            "grupo": "Judas Priest",
            "rol": "guitarrista"
        }, {
            "nombre": "Manolo Lama",
            "grupo": "U2",
            "rol": "cantante"
        }, {
            "nombre": "Melendi",
            "grupo": "Juanitos",
            "rol": "bajista"
        }];

        let response = {
            seller: "Lista de autores",
            autores: autores
        };
        res.render("./authors/authors.twig", response);
    });

    app.get('/authors/*', function (req, res) {
        res.redirect("/authors");
    });
}