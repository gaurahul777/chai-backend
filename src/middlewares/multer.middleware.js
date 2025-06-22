import multer from 'multer'


//req me humara json data aagya , file me jo file client side ne bheji hain ,
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp') // yha cb me apne pehla null hain agr apko koi bhi error handle nhi kerna than apna destination folder jo apna public me humne temp bnaya hain usme
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // for filename change kerne ke liye
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, file.originalname) // yha ho sakta hain ki user same naaam ki 4 -5 file upload kerde woh overwrite ker degyi best practice yhi h ki same name se na bheje but humare passs file bhut bhut km time ke liye rhegyi means ki hum upload ker ke usko unlink ker dengye to abhi ke liye ker lete hain
    }
  })
  
  export const upload = multer({ storage: storage })