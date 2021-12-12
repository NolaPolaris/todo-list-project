/*global app, jasmine, describe, it, beforeEach, expect */
/*
grouping related specs, typically each test file has one at the top level. The string parameter is for naming the collection of specs, and will be concatenated with specs to make a spec's full name.*/


describe('controller', function () {
	'use strict';

	var subject, model, view;

/*
setUpModel(): simule le fonctionnement des différentes modèles, correspondant aux différentes actions possible de l'utilisateur : lister, supprimer, créer, mettre à jour.
*/

	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		/* Création d'un spyObject vide pour gérer les vues et les deux types de comportements des vues par rappoirts aux events : soit un event est lié à la vue, soit il est appelé. */
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		/*Dans l'optique de garder un code "dry" on utilise le beforeEach, qui va permettre d'appeler ces trois fonctions essentielles à chaque tests: un faux modèles sera implémentés, ainsi que la simulation de vue et des différents events qui lui sont reliés. Enfin, le controller permet de relier les deux  entités. Tout le fonctionnement et les différentes étapes du programme sont ainsi testés.*/

		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	/*"it" dans une logique de Behavir Driven Development, les functions "it" permettent une grande lisibilité du code. Chaque function it permet ainsi de tester une action spécifique que le rpogramme doit remplir. 
	On met en suite en place le modèle (setUpModele()) et la vue (setView()) liée à cette action, et on renseigne ce qui est attendu (expect())de chacun des fichiers.*/

	it('should show entries on start-up', function () {
		// TODO: write test
		setUpModel([]);
		subject.setView('');
		expect(view.render).toHaveBeenCalledWith('showEntries', [])

	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = { title: 'my todo' };
			setUpModel([todo]);
			subject.setView('');
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todos = [
				{ title: 'active', completed: false },
				{ title: 'completed', completed: true }
			];
			setUpModel(todos);
			subject.setView('#/');
			expect(view.render).toHaveBeenCalledWith('showEntries', todos);
		});

		it('should show active entries', function () {
			// TODO: write test
			var todo = [
				{ title: 'active', completed: false }
			];
			setUpModel(todo);
			subject.setView('#/active');
			expect(model.read).toHaveBeenCalledWith({ completed: false }, jasmine.any(Function))
			expect(view.render).toHaveBeenCalledWith('showEntries', todo);
		});

		it('should show completed entries', function () {
			// TODO: write test
			var todo = [
				{ title: 'complete', completed: true }
			];
			setUpModel(todo);
			subject.setView('#/completed');
			expect(model.read).toHaveBeenCalledWith({ completed: true }, jasmine.any(Function))
			expect(view.render).toHaveBeenCalledWith('showEntries', todo);
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{ title: 'my todo', completed: true }]);
		subject.setView('');
		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = { id: 42, title: 'my todo', completed: true };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test 
		var todo = [{ id: 41, title: 'my todo 1', completed: false },
		{ id: 42, title: 'my todo', completed: true }];
		setUpModel([todo]);

		subject.setView('');
		expect(view.render).toHaveBeenCalledWith('setFilter', '');

	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		var todo = [{ id: 41, title: 'my todo 1', completed: false },
		{ id: 42, title: 'my todo', completed: true }];
		setUpModel([todo]);
		subject.setView('/active');
		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});

	describe('toggle all', function () {
		it('should toggle all todos to completed', function () {
			// TODO: write test
			var todos = [{
				id: 42,
				title: 'my todo',
				completed: false
			}, {
				id: 41,
				title: 'another todo',
				completed: false
			}];

			setUpModel(todos);
			subject.setView('');

			view.trigger('toggleAll', { completed: true });

			expect(model.update).toHaveBeenCalledWith(42, { completed: true }, jasmine.any(Function));
			expect(model.update).toHaveBeenCalledWith(41, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			// TODO: write test
			var todos = [{
				id: 42,
				title: 'my todo',
				completed: true
			}];

			setUpModel(todos);
			subject.setView('');

			view.trigger('toggleAll', { completed: false });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: false });
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test -A VERIFIER
			setUpModel([]);
			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(model.create).toHaveBeenCalled();
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			// TODO: write test
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove an entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({ completed: true }, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 21, completed: true });

			expect(model.update).toHaveBeenCalledWith(21, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 42, completed: false });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: false });
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItem', { id: 21, title: 'my todo' });
		});

		it('should leave edit mode on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'new title' });
		});

		it('should persist the changes on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(model.update).toHaveBeenCalledWith(21, { title: 'new title' }, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'my todo' });
		});

		it('should not persist the changes on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});