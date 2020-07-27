const path = require('path');
const sander = require('sander');
const dJSON = require('dirty-json');
module.exports = app => {
	
	app.get('/api/programacion/fetch', async(req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.programacion
		})
	});

	app.get('/api/programacion/remove', async(req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.programacion
		})
	});

	app.post('/api/programacion/save', async(req, res) => {
		function generateId() {
			return '_' + Math.random().toString(36).substr(2, 9);
		}
		try {
			let event = req.body
			var dataPath = path.join(process.cwd(), 'config/data.js');
			var data = (await sander.readFile(dataPath)).toString('utf-8')
			data = dJSON.parse(data);
			data.context.programacion = data.context.programacion || []
			
			let index = -1
			if(
			data.context.programacion.find((p,i)=>{
				index = i
				return event.id ? p.id == event.id : p.title == event.title
			})
			){
				event.id = event.id || generateId()
				if(event.isRemove){
					data.context.programacion.splice(index, 1);
				}else{
					data.context.programacion[index] = event
				}
			}else{
				if(!event.isRemove){
					event.id = event.id || generateId()
					data.context.programacion.push(event)
				}
			}
			await sander.writeFile(dataPath,JSON.stringify(data, null, 4))
		} catch (err) {
			console.error('WHILE SAVING LOCAL DATA', err.stack);
			res.status(500).send()
		}
		res.json({
			result: true
		})
	});
}