//?1. query in search box can be in any format? and translation is done from any to all
//message on searchbox says "Write your search query in the PubMed search format" (only? )
//2. What was the extra column?ma
describe('PolyglotSearchController', function(){
	beforeEach(module('app'));

	beforeEach(inject(function($controller, $rootScope){
		$scope = $rootScope.$new();
		controller = $controller('PolyglotSearchController',{
			$scope: $scope
		})
	}));

	describe.skip('should translate', function(){//init in a separate describe?
		it.skip('should translate when query has a value', function(){
			//digest has updated engine values
		});

		it.skip('should translate for each engine', function(){
			//Spy on engine.rewrite
			expect(true).to.be.true
		});
	});
	describe('should translate Double subject (MESH) terms', function(){
		var query;

		beforeEach(function(){
			query = '"Term1 term2"[Mesh]';
		});

		it('ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(exp Term1 term2/)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('([mh "Term1 term2"])');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(\'Term1 term2\'/exp)');//Should this be lowercase?
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('((MH "Term1 term2+"))');
		});

		it.skip('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('(Term1 Term2)');//FIXME: pdf says it should be "Term1 Term2" +Capitalization?
		});
	});
	describe('should translate Subject terms', function(){
		var query;

		beforeEach(function(){
			query = '"Term"[Mesh]';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(exp Term/)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('([mh Term])');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(\'Term\'/exp)');//Should this be lowercase?
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('((MH "Term+"))');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('()');
		});
	});
	describe('should translate Phrase search', function(){
		var query;

		beforeEach(function(){
			query = '"Word1 word2"';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('("Word1 word2")');//FIXME: double quotes missing in pdf??
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('("Word1 word2")');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('("Word1 word2")');//Should this be lowercase?
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('("Word1 word2")');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('("Word1 word2")');
		});
	});
	describe.skip('should translate Title/abstract search', function(){
		var query;

		beforeEach(function(){
			query = 'Term[tiab]';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(Term:ti,ab)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('(Term:ti,ab)');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(Term:ti,ab)');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('(TI Term AB Term)');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('()');
		});
	});
	describe.skip('should translate Title search', function(){
		var query;

		beforeEach(function(){
			query = 'Term[ti]';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(Term:ti)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('(Term:ti)');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(Term:ti)');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('(TI Term)');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('()');
		});
	});
	describe.skip('should translate Abstract search', function(){
		var query;

		beforeEach(function(){
			query = 'Term[ab]';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(Term:ab)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('(Term:ab)');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(Term:ab)');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('(AB Term)');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('()');
		});
	});
	describe.skip('should translate Adjacency search', function(){
		var query;

		beforeEach(function(){
			query = 'Term1 AND Term2';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('()');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('()');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('()');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('()');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('()');
		});
	});
	describe('should translate Wildcard search', function(){
		var query;

		beforeEach(function(){
			query = 'Term*';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(Term*)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('(Term*)');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(Term*)');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('(Term*)');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('(Term*)');
		});
	});
	describe('single search', function(){
		var query;

		beforeEach(function(){
			query = 'Term?';
		});

		it('should translate to ovid medline syntax', function(){
			var ovidMedline = _.find($scope.engines, {id: 'ovid'});
			var translation = ovidMedline.rewriter(query);
			expect(translation).to.equal('(Term$)');
		});

		it('cochrane subject term', function(){
			var cochrane = _.find($scope.engines, {id: 'cochrane'});
			var translation = cochrane.rewriter(query);
			expect(translation).to.equal('(Term?)');
		});

		it('embase subject term', function(){
			var embase = _.find($scope.engines, {id: 'embase'});
			var translation = embase.rewriter(query);
			expect(translation).to.equal('(Term?)');
		});

		it('CINAHL subject term', function(){
			var cinahl = _.find($scope.engines, {id: 'cinahl'});
			var translation = cinahl.rewriter(query);
			expect(translation).to.equal('(Term?)');
		});

		it('web of science subject term', function(){
			var webofscience = _.find($scope.engines, {id: 'webofscience'});
			var translation = webofscience.rewriter(query);
			expect(translation).to.equal('(Term?)');
		});
	});

});
