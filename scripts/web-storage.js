const { Web3Storage, getFilesFromPath } = require("web3.storage");

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFjZDA5ZTQwQTA3MTkxQTNmYWM3MzhmMmRjNGYzMzA3OGJmYzEyNTMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTI5Njk5NjIyOTQsIm5hbWUiOiJORlQgTWFya2V0UGxhY2UifQ.vy6nPja8xbN9qi9sqGIOW12nqiYEJLoBWUN4xIxXX1E'

const client = new Web3Storage({ token })

async function storeFiles() {
    // const files = await getFilesFromPath('C:\\Users\\Ameer Hamza\\Pictures\\MV\\images')
    const files = await getFilesFromPath('C:\\Users\\Ameer Hamza\\Pictures\\MV\\web.storage json')
    const cid = await client.put(files)
    console.log("CID=", cid)
}

storeFiles().then(() => {
    console.log("Files stored")
}).catch(err => { console.log("Error occured", err) })