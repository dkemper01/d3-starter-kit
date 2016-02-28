var chai = chai || require('chai');
var request = request || require('superagent');

describe('is up', () => {
  
  var indexHtml = null;
  
  it('has response', function(done) {
    
    function requestLiveSite() {
        
        request
        .get('http://localhost:3002')
        .end(function(err, response) {
          
            if (err) { 
                console.log(err); 
                
                if (err.code == 'ECONNREFUSED') {
                    setTimeout(requestLiveSite, 2000);
                }
                
            } else if (response) {

                chai.expect(response.status).to.equal(200);
                done();
            }
        });
    }
      
    this.timeout(20000);
    requestLiveSite();
      
  });
});