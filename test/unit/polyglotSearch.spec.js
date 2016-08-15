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

	describe('should translate', function(){//init in a separate describe?
		it('should translate when query has a value', function(){
			//digest has updated engine values
		});

		it('should translate for each engine', function(){
			//Spy on engine.rewrite
			expect(true).to.be.true
		});
	});
	describe('should translate Double subject (MESH) terms', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = '"Term1 term2"[Mesh]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(exp Term1 term2/)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh "Term1 term2"])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term1 term2\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term1 term2+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('("Term1 term2")');
			});
		});

		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'exp Term1 term2/';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('("Term1 term2"[MESH])');
			});

			it('to cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh "Term1 term2"])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term1 term2\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term1 term2+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('("Term1 term2")');
			});
		});

	});
	describe('should translate Subject terms', function(){
		describe('from PubMed syntax 1', function(){
			var query;

			beforeEach(function(){
				query = '"Term"[Mesh]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(exp Term/)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh Term])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from PubMed syntax 2', function(){
			var query;

			beforeEach(function(){
				query = '"Term"[Mesh fields]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(exp Term/)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh Term])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from PubMed syntax 3', function(){
			var query;

			beforeEach(function(){
				query = '"Term"[mh]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(exp Term/)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh Term])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'exp Term/';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term[MESH])');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('([mh Term])');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(\'Term\'/exp)');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('((MH "Term+"))');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
	});
	describe('should translate Phrase search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = '"Word1 word2"';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');//FIXME: double quotes missing in pdf??
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = '"Word1 word2"';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');//FIXME: double quotes missing in pdf??
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');//Should this be lowercase?
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('("Word1 word2")');
			});
		});

	});
	describe('should translate Title/abstract search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = '"Term"[tiab]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term.tw.)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(TI Term AB Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from Ovid medline syntax 1', function(){
			var query;

			beforeEach(function(){
				query = 'Term:ti,ab';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term[tiab])');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(TI Term AB Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from Ovid medline syntax 2', function(){
			var query;

			beforeEach(function(){
				query = '"Term".tw.';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term[tiab])');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ti,ab)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(TI Term AB Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
	});
	describe('should translate Title search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term[ti]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term:ti)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ti)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ti)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(TI Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term:ti';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term[ti])');
			});

			it('to cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ti)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ti)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(TI Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
	});
	describe('should translate Abstract search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = '"Term"[ab]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term:ab)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ab)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ab)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(ab Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term:ab';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term[ab])');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term:ab)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term:ab)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(AB Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('()');
			});
		});

	});
	describe('should translate All fields', function(){
		describe('from PubMed syntax 1', function(){
			var query;

			beforeEach(function(){
				query = 'Term';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term)');
			});
		});
		describe('from PubMed syntax 2', function(){
			var query;

			beforeEach(function(){
				query = 'Term[all fields]';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term)');
			});
		});
		describe('from Ovid medline syntax 1', function(){
			var query;

			beforeEach(function(){
				query = 'Term';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term)');
			});
		});
		describe('from Ovid medline syntax 2', function(){
			var query;

			beforeEach(function(){
				query = 'Term.mp.';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term)');
			});
		});

	});
	describe('should translate Adjacency search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term1 AND Term2';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term1 ADJ3 Term2)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term1 NEAR3 Term2)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('()');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term1 N3 Term2)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term1 Term2)');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term1 ADJ3 Term2';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term1 Term2)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term1 NEAR3 Term2)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('()');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term1 N3 Term2)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term1 Term2)');
			});
		});

	});
	describe('should translate Wildcard search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term*';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term*';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});
		});

	});
	describe('single search', function(){
		describe('from PubMed syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term?';
			});

			it('to Ovid medline syntax', function(){
				var ovidMedline = _.find($scope.engines, {id: 'ovid'});
				var translation = ovidMedline.rewriter(query);
				expect(translation).to.equal('(Term$)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});
		});
		describe('from Ovid medline syntax', function(){
			var query;

			beforeEach(function(){
				query = 'Term$';
			});

			it('to PubMed syntax', function(){
				var pubMed = _.find($scope.engines, {id: 'pubmed'});
				var translation = pubMed.rewriter(query);
				expect(translation).to.equal('(Term*)');
			});

			it('to Cochrane syntax', function(){
				var cochrane = _.find($scope.engines, {id: 'cochrane'});
				var translation = cochrane.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to Embase syntax', function(){
				var embase = _.find($scope.engines, {id: 'embase'});
				var translation = embase.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to CINAHL syntax', function(){
				var cinahl = _.find($scope.engines, {id: 'cinahl'});
				var translation = cinahl.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});

			it('to Web of science syntax', function(){
				var webofscience = _.find($scope.engines, {id: 'webofscience'});
				var translation = webofscience.rewriter(query);
				expect(translation).to.equal('(Term?)');
			});
		});

	});

});
