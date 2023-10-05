const {request, response} = requiere ('express')

const usersList = (req = request, res = response)=>{
    res.json({msg:'Hola usuario, llévame con tu lider...'})
}

module.exports = {usersList};