const fs = require('fs');
const router = require('express').Router();
const path=require("path");
const {init,B,Response,dm}=require('liburno_bklib');
init();


const dbchat=()=> {
        var ff=dm.getfile("chat.db");
        var fl=fs.existsSync(ff);
        var d=dm.dbget(ff); 
        if (!fl) {
            
 
 
        }
        return d;
}

module.exports = router;
router
.post('/jServizio' ,(req, res) => {
    try {
        var u=dm.checkuser(req,0)
        var {count} = req.body;
        u.count=count;
        res.send(new Response(req,u))
    } catch(e) { res.send(new Response(req,undefined,e)); }
})
