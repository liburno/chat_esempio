const { init, B, Response, dm } = require('liburno_bklib');
const { Reset, Bold, Reverse, Red, Green, Yellow, Blue, Magenta, Cyan, White } = init();
const fs = require('fs');
const dbchat = () => {
    var ff = dm.getfile("chat.db");

    var fl = fs.existsSync(ff);
    var d = dm.dbget(ff);
    if (!fl) {
        d.run(`CREATE TABLE if not exists chat (
        date REAL DEFAULT 0,
        user NVARCHAR COLLATE NOCASE DEFAULT '',
        dest NVARCHAR COLLATE NOCASE DEFAULT '',
        private INTEGER DEFAULT 0,
        text NVARCHAR COLLATE NOCASE DEFAULT ''
        );
        CREATE TABLE if not exists users (
            user NVARCHAR COLLATE NOCASE DEFAULT '',
            PRIMARY KEY (user)
         );
        `)
    }
    return d;
}

module.exports = function (io) {
    console.log(`${Magenta}Starting Sockets...!${Reset}`);
    function listmessages(socket, db) {
        var sql = "select rowid,date,user,dest,private,text from chat where private=0 or dest=? or user=? order by rowid desc limit 20;"
        var rr = db.prepare(sql).all(socket.uname, socket.uname);
        socket.emit('messages', rr);
    }

    io.on('connection', (socket) => {
        let addedUser = false;
        console.log(`${Magenta}Socket Connected${Reset}`)
        socket.on('login', data => {
            console.log(`${Yellow}Login: ${Green}${data}${Reset}`)
            if (socket.uname && socket.uname != data) {
                socket.broadcast.emit('access', {
                    name: socket.uname,
                    value:false
                });
            }
            socket.uname = data
            var db = dbchat()
            socket.broadcast.emit('access', {
                name: socket.uname,
                value:true
            });
            db.run("insert or replace into users (user) values (?)", socket.uname);
            listmessages(socket, db);
            db.chiudi();
        })
        socket.on('logout', data => {
            if (socket.uname) {
                console.log(`${Yellow}Logout: ${Red}${socket.uname}${Reset}`)
                socket.broadcast.emit('access', {
                    name: socket.uname,
                    value:false
                });
                socket.uname=null;
            }
        })
        socket.on('messages', data => {
            if (socket.uname) {
                var db = dbchat()
                listmessages(socket, db);
                db.chiudi();
            }
        })
        socket.on('newmsg',data=>{
            if (socket.uname && data && data.text) {
                data.user=socket.uname;
                if (!data.dest) data.private=false;
                var db=dbchat(); 
                data.data=new Date().toFloat();
                data.rowid=db.run("insert or replace into chat (date, user, dest, private, text) values (?,?,?,?,?)",data.data,socket.uname, data.dest,data.private?1:0,data.text)
                socket.broadcast.emit("addmsg",data);
                db.chiudi();
            }
        })
        socket.on('typing', (mode) => {
            if (socket.uname) {
                console.log("ty:",socket.uname,mode);
                socket.broadcast.emit('istyping', {
                    name: socket.uname,
                    mode
                });
            }
        });

    });
}