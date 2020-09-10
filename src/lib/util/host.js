const isLocal = window.location.hostname === 'localhost'
const host = {
     yingapp: isLocal ? 'http://localhost:50' : 'https://yingapp.herokuapp.com'
}
export default host