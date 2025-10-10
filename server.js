const fs = require("fs");
const http = require("http");
const port = 3000;
const server = http.createServer();
const host = "localhost";
const crypto = require("crypto");
const { Client } = require('pg');

const Like_part1 = `<svg class="coeur"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"`;

const Like_part2 =`> <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" onclick="handleclick(event)"/>
              </svg>`; 

require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


client.connect()
.then(() => {
    console.log('Connected to database');
})
.catch((e) => {
    console.log('Error connecting to database');
    console.log(e);
});

let lastSessionId = 0;
let sessions = [];

server.on("request", async (req, res) => {
    let hasCookieWithSessionId = false;
    let sessionId = undefined;
    let user = "";
    let user_id;
    let connected = false;
    if (req.headers['cookie'] !== undefined) {
        let sessionIdInCookie = req.headers['cookie'].split(';').find(item => item.startsWith('session-id'));
        if (sessionIdInCookie !== undefined) {
            let sessionIdInt = parseInt(sessionIdInCookie.split('=')[1]);
            if (sessions[sessionIdInt]) {
                hasCookieWithSessionId = true;
                sessionId = sessionIdInt;
                sessions[sessionId].nbVisite++;
                visite = sessions[sessionId].nbVisite
                if(sessions[sessionId].username)
                {
                    user = sessions[sessionId].username;
                    user_id = sessions[sessionId].id_user;
                    connected = true;
                }
            }
        }
    }
    if (!hasCookieWithSessionId) {
        lastSessionId++;
        res.setHeader('Set-Cookie', `session-id=${lastSessionId}; Path = '/'`);
        sessionId = lastSessionId;
        sessions[lastSessionId] = {
            'nbRequete': 1
        }
    }

    if (req.url.startsWith('/public/')) {                            // ---------------------------------- fichier Statique -------------------------------------------------------------------
        try {
            const ressource = fs.readFileSync("." + req.url);
            res.end(ressource);
        } catch (error) {
            let html = '<html><head><meta charset="utf-8"></head><body><h1>404 Error</h1>';
            html += '<p>Page not found</p>';
            html += '<a href="/">Retour à l\'accueil</a>';
            html += '</body></html>';
            res.statusCode = 404;
            res.end(html);
        } 
    } else if (req.url === '/mur-images') {                               // ---------------------------------- Mur d'images -------------------------------------------------------------------
        try {
            const sqlQuery = `SELECT id, fichier, f.likes FROM images LEFT JOIN (SELECT id_image, COUNT(*) as likes FROM accounts_images_like GROUP BY id_image) as f ON id = id_image ORDER BY id;`;
            const sqlResult = await client.query(sqlQuery); 
            const fichiersImage = sqlResult.rows.map(row => row.fichier);
            const fichiersLike = [];
            console.table(sqlResult.rows);
            for(let i = 0; i< sqlResult.rows.length; i++){
                const nbLike = sqlResult.rows[i].likes;
                const nbId = sqlResult.rows[i].id;
                console.log("id : ", nbId,' likes : ', nbLike);
                if(nbLike !== null) { 
                    fichiersLike[i] = nbLike;
                } else {
                    fichiersLike[i] = 0;
                } 
            }                
            console.log(fichiersLike);
            const fichiersId = sqlResult.rows.map(row => row.id);         
            let pageHTML = "<!DOCTYPE html><html lang='fr' >"
            pageHTML += '<head><link rel="stylesheet" href="/public/style.css"> <meta charset="utf-8"></head>';
            pageHTML += '<body><div class="screen">'+ user +'<a href="/">accueil</a>';
            if(!connected) pageHTML += '<div class = "log"><span id="log_logo"></span><a id ="signup">s\'inscrire</a><a id="signin">se connecter</a> <script src="/public/index.js"></script></div>';
            else pageHTML += '<div class = "log">Connecter en tant que '+user+' <a href="/deco">Se deconnecter</a></div>';
            pageHTML += '<h1>Mur d\'images</h1>';
            pageHTML += '<div id="mur">';
            var Liked_Images;
            if(connected){
                const queryImgLiked = `SELECT id_image FROM accounts_images_like WHERE id_account = ${user_id} ORDER BY id_account;`;
                const Query_Liked_Images = await client.query(queryImgLiked);
                console.table(Query_Liked_Images.rows);
                console.log("juste avant liked images");
                Liked_Images = Query_Liked_Images.rows.map(row => row.id_image);
                console.log(Liked_Images);
            }
            console.log("liked tab passé");
            for (let i = 0 ; i < fichiersImage.length ; i++) {
                const like = fichiersLike[i];
                const id_img = fichiersId[i];
                const fichierSmallImage = fichiersImage[i].split('.')[0] + '_small.jpg';
                const img = '<img id="img_'+ id_img+'" src="/public/images/'+fichierSmallImage+'" />';
                pageHTML += '<div class="img_mur"';
                if(connected)
                {
                    if(intab(id_img, Liked_Images)){
                        console.log(id_img + ' is liked');
                        pageHTML += 'liked="true"';
                    } else {
                        pageHTML += 'liked="false"';
                    }
                }
                pageHTML += 'on="false" id="image_'+ id_img+'"><a href="/page-image/'+id_img+'" >' + img + '</a><div class="like_bar"> <div class="like_texte">'+Like_part1+'like='+like+Like_part2+'<span>'+like+'</span></div> </div></div>';
            }
            pageHTML += '</div>';
            if(connected) pageHTML += "<script src ='/public/mur-image.js'></script> </body></html>";
            else pageHTML += "<div>Vous n'etes pas connecte</div></div></body></html>"
            res.end(pageHTML);
        } catch (e) {
            console.log(e);
            res.end(e);
        } 
    } else if(req.url === '/' || req.url === "/index"){                          // ----------------------------------page index -------------------------------------------------------------------
        console.log( "user = "+ user, connected);
        client.query("SELECT fichier,id FROM images ORDER BY date DESC LIMIT 3;")
        .then((result)=>{
            const fichiersImage = result.rows.map(row => row.fichier);
            const idImage = result.rows.map(row => row.id);
            let html = "<!DOCTYPE html> <head><meta charset = 'utf-8'> <title>Mon Mur d'images</title> <link rel='stylesheet' href='/public/style.css'></head>";
            html +='<body><div class="screen"><div> Bonjour '+ user +'</div>' 
            if(!connected) html += '<div class = "log"><span id="log_logo"></span><a id ="signup">s\'inscrire</a><a id="signin">se connecter</a></div>';
            else html += '<div class = "log">Connecté en tant que '+user+' <a href="/deco">Se deconnecter</a></div>';
            html+= '<div class="menu">';
            html +='<div><img id="logo"src="/public/images/logo.png" width="100"></div>';
            html +='<div>Vous trouverez ici les images que j\'aime.</div><div>';
            for(let i = 0; i< fichiersImage.length; i++)
            {
                const fichierSmallImage = fichiersImage[i].split('.')[0]+"_small.jpg";
                const id_img = idImage[i];
                html +='<a href="/page-image/'+id_img+'"><img src="/public/images/'+ fichierSmallImage+'" height="150"></a>';
            }
            html += '<div>'
            html +='<div><a class="button" href="/mur-images">Toutes les images</a></div>';
            html += '<script src="/public/index.js"></script></div></body></html>';
            res.end(html);  
        })
        .catch((e)=>{
            console.log(e)
            const index = fs.readFileSync("./public/index.html", "utf-8");
            res.end("index");
        });
    } else if(req.url.startsWith("/page-image/") && req.method == "GET") {   // ---------------------------------- page image -------------------------------------------------------------------
        let url = req.url.split("/");
        if (url.length != 3) {
          let html = '<html><head><meta charset="utf-8"></head><body><h1>404 Error</h1>';
            html += '<p>Page not found</p>';
            html += '<a href="/">Retour à l\'accueil</a>';
            html += '</body></html>';
            res.statusCode = 404;
            res.end(html);
        } else {
            const id_img = url[2]; // numéro de l'image
            var index_img = 0 // index de la ligne de l'image dans sqlResult.rows
            const id_suivant = String(Number(id_img) + 1);
            const id_precedent = String(Number(id_img) - 1);
            const sqlQuery = "SELECT i.id,i.nom,i.fichier FROM (SELECT id,nom,fichier FROM images WHERE id <="+id_suivant+" AND id >="+id_precedent+" ORDER BY id) AS i;";
            client.query(sqlQuery)
            .then((sqlResult) =>{
                console.log(sqlResult.rows);
                console.log("requete execute avec succes");
                /* obtenir la ligne correspondante à l'image*/
                for(let i = 0;i<sqlResult.rows.length;i++)  
                {
                    if(sqlResult.rows[i].id == id_img)
                    {
                        index_img = i;
                    }
                }
                let html = "<!DOCTYPE html> <html lang='fr'> <meta charset='utf-8'><head><title>Mon Mur d'images</title> <meta charset='utf-8'> <link rel='stylesheet' href='/public/style.css'></head>";
                html += "<body><div class='screen'><a href='/mur-images'>Mur</a> ";
                if(!connected) html += '<div class = "log"><span id="log_logo"></span><a id ="signup">s\'inscrire</a><a id="signin">se connecter</a><script src="/public/index.js"></script></div>';
                else html += '<div class = "log">Connecter en tant que '+user+' <a href="/deco">Se deconnecter</a></div>';
                html += "<div class='main'><div><img src='/public/images/"+ sqlResult.rows[index_img].fichier+"'></div>";
                html +="<div>"+sqlResult.rows[index_img].nom+"</div>"   
                html += "<div class='comment'>";
                const sqlQuery2 = "SELECT texte FROM commentaires WHERE id_image = "+id_img+";";
                client.query(sqlQuery2)
                .then((sqlResult2)=>{
                    console.log("requete sql2 executee avec succes");
                    if(sqlResult2.rows.length<=0) ;
                    else {
                        for(let i = 0;i<sqlResult2.rows.length;i++)
                            {
                                html += "<div>"+sqlResult2.rows[i].texte+"</div>";
                            }
                    }
                    html += "</div>"
                    if(connected) html += "<div class='formulaire'><form action ='/image-description/" + sqlResult.rows[index_img].id + "'method='post'> <input type='text' name='description' placeholder='Ajouter un commentaire'><input id='send' type='submit' value'Envoyer'></form></div></div>";
                    let spanL="<div class='bottom'><span class='left'>";
                    let spanR="<span class='right'>";
                    for(let i = 0;i<sqlResult.rows.length;i++)
                    {
                        var id_i = sqlResult.rows[i].id
                        if(id_i < id_img)
                        {
                            spanL += "<a href='/page-image/" + id_precedent + "'><img src='/public/images/"+sqlResult.rows[index_img-1].fichier+"'></a>";
                        } else if(id_i>id_img)
                        {
                            spanR += "<a href='/page-image/" + id_suivant + "'><img src='/public/images/"+sqlResult.rows[index_img+1].fichier+"'></a>";
                        }
                    }
                    spanL += "</span>"
                    spanR += "</span></div>"
                    html+= spanL + spanR +"<script src='/public/page-image.js'></script></div></body></html>";
                    res.end(html);
                })
                .catch((e)=>{
                    console.log("erreur dans la requete sql 2");
                    console.log(e);
                });
            })
            .catch((e)=>{
                console.log(e);
            });
            
        }
    } else if (req.method == "POST" && req.url.startsWith("/image-description/"))           // ---------------------------------- ajouter commentaire -------------------------------------------------------------------
    {
        let donnees;
        req.on("data", (Data) => {
            donnees += Data.toString();
        });
        req.on("end",()=>{
            const img_comment = donnees.split("=")[1];
            const comment_tab_form = img_comment.split("+");
            let commentaire = "";
            for (let i = 0; i < comment_tab_form.length; i++) 
            {
                commentaire += comment_tab_form[i] + " ";
            }
            console.log(commentaire);
            const id_img = Number(req.url.split('/')[2]);
            client.query("INSERT INTO commentaires (texte,id_image) VALUES ('"+user+": "+commentaire+"', "+id_img+");")
            .then(()=>{
                console.log("commentaire ajoute avec succes");
                res.statusCode = 302;
                res.setHeader('Location', '/page-image/' + id_img);
                res.end();
            })
            .catch((e)=>{
                console.log("erreur requete sql");
                console.log(e);
            });
        });
        
    } else if(req.url === "/signup" && req.method === "POST"){                           // ---------------------------------- sign up, s'inscrire -------------------------------------------------------------------
        let data = "";
        req.on("data", (dataChunk) => {
            data += dataChunk.toString();
            console.log(data);
        });
        req.on("end", async () =>{

            try { 
                console.log(data);
                const username = data.split('&')[0].split('=')[1];
                const mdp = data.split('&')[1].split('=')[1];
                const query = `SELECT username FROM accounts WHERE username = '${username}';`
                const resQuery = await client.query(query);
                if(parseInt(resQuery.rows.length) !== 0) {
                    console.log(resQuery.rows);
                    res.end(`<html><body><h1>Sign UP Failure</h1><div>Username already signed up !</div><a href="/">Retry</a></body></html>`);
                } else {
                    const salt = crypto.randomBytes(16).toString('hex');
                    const hash = crypto.createHash("sha256").update(mdp).update(salt).digest("hex");
                    const insertQuery = `INSERT INTO accounts (username,salt,hash) VALUES ('${username}', decode('${salt}','hex'), decode('${hash}','hex'));`;
                    await client.query(insertQuery); 
                    res.end(`<html><body><h1>Sign Up is a Success</h1><a href="/">You can sign in now !</a></body></html>`);
                }
            } catch (e) {
                console.log(e);
                res.end(`<html><body><h1>Failure</h1><a href="/">Retry</a></body></html>`);
            }
        });

    } else if (req.url === '/signin' && req.method === 'POST') {                         // ---------------------------------- sign in, se connecter -------------------------------------------------------------------
        let data;
        req.on("data", (dataChunk) => {
            data += dataChunk.toString();
        });
        req.on("end", async () => {
            try {
                const params = data.split("&");
                const username = params[0].split("=")[1];
                const password = params[1].split("=")[1];
                const findQuery = `SELECT id, username, encode(salt,'hex') AS salt, encode(hash,'hex') AS hash FROM accounts WHERE username='${username}'`; 
                const findResult = await client.query(findQuery);
                const USERNAME_IS_UNKNOWN = 0;
                if (parseInt(findResult.rows.length) !== USERNAME_IS_UNKNOWN) {
                    const salt = findResult.rows[0].salt;
                    const trueHash = findResult.rows[0].hash;
                    const computedHash = crypto.createHash("sha256").update(password).update(salt).digest("hex");
                    if (trueHash === computedHash) { //AUTHENTICATED
                        const id = findResult.rows[0].id;
                        sessions[sessionId].username = username;
                        sessions[sessionId].id_user = id;
                        console.log(` username = ${username}, id = ${id}`);
                        res.end(`<html><body><h1>Sign In Success</h1>Welcome ${username}. Visit <a href="/">our site</a> </body></html>`);
                    } else {
                        res.end(`<html><body><h1>Sign IN Failure</h1> Wrong Password ! <a href="/">Retry</a></body></html>`);
                    }
                } else {
                    res.end(`<html><body><h1>Sign IN Failure</h1> Wrong Username ! <a href="/">Retry</a></body></html>`);
                }
            } catch(e) {
                console.log(e);
                res.end(`<html><body><h1>Something goes wrong</h1> <a href="/">Retry</a></body></html>`);
            }
        });
    } else if(req.url.startsWith("/like")) {                                                           // ---------------------------------- gerer Like -------------------------------------------------------------------
        console.log("try add");
        if(connected){  // si l'utilisateur est connecté, on essage d'ajouter dans la base de données
            console.log('connected');
            console.log(req.url);
            const add_or_remove = req.url.split('/')[1].split('_')[1];
            console.log(add_or_remove);
            if(req.url.split('/').length != 3)  // on verifie que l'url est correcte
            {
                console.log("erreur root url");
                res.statusCode = 404;
                res.end("erreur");
            } else if( add_or_remove != 'add' && add_or_remove != 'remove'){  // si l'url n'est pas /like_add/   ou /like_remove/
                console.log("erreur url add remove");
                res.statusCode = 404;
                res.end("erreur");            
            } else {                            // l'url est correcte
                const username = user; 
                const id_image = parseInt(req.url.split('/')[2]);
                const sqlQuery_get_User_id = `SELECT id FROM accounts WHERE username = '${username}';`;
                client.query(sqlQuery_get_User_id) 
                .then((resQuery_get_id) => {   
                    console.log(resQuery_get_id.rows);
                    const id_user = resQuery_get_id.rows[0].id;
                    console.log(id_user);
                    // ajouter le like, donc l'id_image et id_user dans la table accounts_images_like  ------------------
                    const sqlQuery_get_id_image= `SELECT id FROM images WHERE id = ${id_image};`;
                    client.query(sqlQuery_get_id_image)
                    .then((resQuery_get_id_image) =>{
                        if(resQuery_get_id_image.rows.length <= 0){   // image n'a pas été trouvée
                            console.log("error, image did not get found");
                            res.statusCode = 400;
                            res.end("error")
                        } else {                                    // image trouvée
                            const sqlQuery_add = `INSERT INTO accounts_images_like(id_image, id_account) VALUES (${id_image}, ${id_user});`;
                            client.query(sqlQuery_add)
                            .then(()=>{
                                console.log("Added to accounts_images_like"); 
                                res.end("ajoutée");                               
                            })
                            .catch((e)=>{
                                console.log("error, it didnt get added to accounts_images_like");
                                console.log(e);
                                res.statusCode = 400;
                                res.end("error");
                            })
                        }
                    })
                })
                .catch((e)=>{
                    console.log('error, executing query');
                    console.log(e);
                    res.statusCode = 400;
                    res.end("error");

                });
            }
            console.log("done");
        } else {     // si l'utilisateur n'est pas connecté, erreur
            res.statusCode = 400;
            res.end("non connecté");
        } 
    } else if(req.url === "/deco" && req.method === "GET"){
        sessions[sessionId].username = undefined;
        sessions[sessionId].id_user = undefined;
        connected = false;
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
    } else {
        res.end(`<html><body><h1>Invalid URL</h1><a href="/">our site</a></body></html>`);
    }
});

server.listen(port,host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});


function intab(value, t){
    let bool = false;
    for(let i of t){
        bool = bool || value == i
    }
    return bool;
}
