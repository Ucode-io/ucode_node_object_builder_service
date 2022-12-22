const project = require('./storage/mongo/project');
const config = require('./config/index');

(async function(){
    try {
        await project.register(config.ucodeDefaultProjectID)
        console.log('successfully registered')
    } catch (e) {
        console.log('fail register', e)
    }

    try {
        const mongoConn = await project.getByID(config.ucodeDefaultProjectID)
        const App = mongoConn.models['App']
        let newApp = new App({name: 'testest'})

        try {
            await newApp.save()
            console.log('successfully saved')
        } catch (e) {
            console.log('fail get', e)
        }
       
    } catch (e) {
        console.log('fail get', e)
    }

    try {
        await project.deregister(config.ucodeDefaultProjectID)
        console.log('successfully deregistered')
    } catch (e) {
        console.log('fail get', e)
    }
})();
