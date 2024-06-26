const express = require('express');
const app  = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));
// css, js, img 파일을 가져다 쓰려면 서버에 등록해야 함. 보통은 static파일이라고 함.  이 부분은 그냥 필수임.
app.use(express.static(__dirname +'/public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended:true }));



let db;
const url = 'mongodb+srv://jugumtong:choi942912@cluster0.yrxos9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client)=>{
    console.log("DB연결성공");
    db = client.db('forum');
    app.listen(8080, ()=> {
        console.log('http://localhost:8080에서 서버 실행중');
    });
}).catch((err)=>{
    console.log(err);
})

app.get('/', (요청, 응답) => {
    //응답.sendFile(__dirname + '/index.html');
    응답.render('index.ejs');
});

app.get('/news', (요청, 응답) => {
    //db.collection('post').insertOne({title:'어쩌구'}); // DB에 데이터 넣는 문법 그냥 외워라!
    응답.send('<h1>여기는 뉴스 페이지야!!!</h1>');
});

//DB에서 데이터 가져오는 문법 그냥 외어라!!
app.get('/list', async(요청, 응답) => {
    let result = await db.collection('post').find().toArray();
    // console.log(result[0].title);
    응답.render('list.ejs', {posts: result});
});

app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html');
});

app.get('/time', (요청, 응답) => {
    응답.render('time.ejs', {time: new Date()});
});

app.get('/write', (요청, 응답) => {
    응답.render('write.ejs');
});

app.post('/add', async(요청, 응답) => {

    try {
        if(요청.body.title == '' ){
            응답.send('제목입력 안했음')
        }else{
            await db.collection('post').insertOne({title: 요청.body.title, content:요청.body.content});
            응답.redirect('/list');
        }
    }catch(e){
        console.log(e);
        응답.status(500).send('서버에러남');
    }

    
});

app.get('/detail/:id', async(요청, 응답) => {
    
    try{
        let result = await db.collection('post').findOne({_id: new ObjectId(요청.params.id)}) // document 한개마 가져와~
        if(result == null) {
            응답.status(404).send('이상한 URL탐지');
        }
        응답.render('detail.ejs', { result : result});
    }catch(e){
        console.log(e);
        응답.status(404).send('이상한 URL탐지');
    }
});

app.get('/edit/:id', async(요청, 응답) => {
    let result = await db.collection('post').findOne({_id: new ObjectId(요청.params.id)}) // document 한개마 가져와~
    // console.log(result);
    
    응답.render('edit.ejs',  { result : result});
});

app.put('/edit', async(요청, 응답) => {
    
    //await db.collection('post').updateOne({_id: 1}, //updateMany({like:{$gt : 10}})
    //{$set : {like: 1}} // 덮어쓰기
    //{$inc : {like: -2}} // 증가
    //{$mul : {like: 2}} // 곱하기
    //{$unset : {like: 2}} // 삭제
    //);


    await db.collection('post').updateOne({_id: new ObjectId(요청.body.id)}, 
    {$set : {title: 요청.body.title, content: 요청.body.content}}
    );
    console.log(요청.body);

    응답.redirect('/list');
});

app.post('/abc', async(요청, 응답)=>{
    console.log('안녕');
    console.log(요청.body);
    
});

app.delete('/delete', async(요청, 응답)=>{
    console.log(요청.query);
    await db.collection('post').deleteOne({_id: new ObjectId(요청.query.docid)});
    응답.send('삭제완료');
})