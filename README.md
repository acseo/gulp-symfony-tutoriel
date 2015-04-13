symfony-gulp-example
====================

## Remerciements
Cet article est inspiré et traduit d'un article de Florian Eckerstorfer, accessible en anglais à l'adresse : [https://florian.ec/articles/buliding-symfony2-with-gulp/]()

## Introduction
Assetic, outil largement utilisé dans les projets Symfony pour la gestion des *assets*, est de plus en plus remplacé par des outils tels que [Grunt](http://gruntjs.com/) ou [Gulp](http://gulpjs.com/).

Cet article présente une façon d'utiliser Gulp dans un projet Symfony 2.

Gulp sera utilisé non seulement pour construire les *assets*, mais également pour lancer les **tests**, et des outils tels que des tests de **couverture de code** et **checkstyle**.

[ toc ]

## Pour démarrer
Tout d'abord, voici les outils qui seront utilisés pour faire fonctionner le projet.

* [Gulp](http://gulpjs.com/) pour lancer les différentes tâches (ainsi qu'un certain nombre de plugins et de modules Node.js)
* [Bower](http://bower.io/) pour installer et gérer nos *assets*.
* [Sass](http://sass-lang.com/)
* [RequireJS](http://www.requirejs.org/) pour charger dynamiquement nos fichiers Javascript
* [Bootstrap](http://getbootstrap.com/) 
* [jQuery](http://jquery.com/)
* [PHPUnit](http://phpunit.de/)
* [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer)

## Structure du projet :

Chaque projet Symfony qui utilise l'édition standard possède la même structure. Par convention, la commande ``assets:install`` copiera tout ce qui ce trouve dans le répertoire ``Resources/public`` dans le répertoire ``web`` du projet. Nous utiliserons cette convention pour gérer les chemins dans les fichiers Sass, Javascript et Gulp. Voici donc un apperçu de l'arborescence des fichiers de notre projet d'exemple :

```
- src/Bundle/
    - AppBundle/
        - Resources/public/
            - js/
            - sass/
    - FrontBundle/
        - Resources/public/
            - js/
            - sass/
    - UserBundle/
        - Resources/public
            - js/
            - sass/
- web/
    - bundles/
    - components/
    - css/
    - fonts/
    - js/
- Gulpfile.js
```

Lorsque nous exécutons la commande ``assets:install --symlink``, Symfony crééra des liens symboliques entre le répertoire ``web/bundles/`` et le répértoire public de chaque Bundle. Avec la structure précédement citée, le répertoire ``web/bundles`` ressemblera à ça :

```
- web/bundles/
    - app/
    - front/
    - user/
```

le répertoire ``web/css/`` contiendra les fichiers CSS compilés, ``web/fonts/`` les différentes fonts utilisées, ``web/js/`` les fichiers Javascript, et enfin ``web/coponents/`` les fichiers téléchargés par Bower. Nous y reviendrons plus tard.

## Gulp

si vous n'avez jamais entendu parler de Gulp et vous demandez comment l'installer, vous pouvez vous rendre sur ces pages [Getting started guide](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) 
ou [Building with Gulp](http://www.smashingmagazine.com/2014/06/11/building-with-gulp/). 
Pour la faire courte, vous pouvez installer Gulp avec [NPM](https://www.npmjs.org/).

Voici les commandes pour installer Gulp globalement et localement dans votre projet :

```sh
$ npm install -g gulp
$ npm install --save-dev gulp
```

Puis, vous pouvez créer un fichier ``Gulpfile.js`` et faire un appel au module ``gulp`` :

```javascript
var gulp = require('gulp');

gulp.task('default', function () {});
```

## Feuilles de style
Premièrement, nous allons nous occuper des css dans le projet

### Feuilles de styles avec Sass

Sass propose de nombreuses fonctionnalités qui le rende supérieur au CSS. Une de ces fonctionnalité est la possibilité de définir des variables. Cependant, is l'on compile les différents fichiers Sass séparément et qu'on les concatène ensuite, nous ne pouvons pas référencer les variables depuis différents fichiers sources.
Etant donné que nous ne souhaitons avoir q'un seul fichier Sass, nous allons utiliser la directive ``import`` pour les regrouper tous dans un seul fichier. nous allons placer un ``master.scss``dans chacun des bundles et importer tous les fichiers ``.scss`` du bundle. Le fichier ``master.scss``du bundle *FrontBundle* incluera les fichiers ``master.scss`` de l'ensemble des autres Bundles. Il ressemblera à cela :

```css
// src/Acme/Bundle/FrontBundle/Resources/public/sass/master.scss

@import '../../user/sass/master';
@import '../../app/sass/master';
```

### Gestion des *assets* avec Bower

Avant de parler de l'utilisation de Bootstrap, nous allos évoquer Bower. La première chose à faire pour utiliser Bower dans notre contexte est de changer le répertoire de téléchargement par défauten créant un fichier ``.bowerrc``.

```json
{
  "directory": "web/components"
}
```

Ensuite, nous installerons ``bootstrap-sass-official`` en utilisant la commande :

```
bower install --save bootstrap-sass-official
```

### Utilisation de Bootstrap

Une fois Bootstrap installé vi Bower, nous allons mettre à jour le fichier ``master.scss`` présent dans **FrontBundle**


```css
// src/FrontBundle/Resources/public/sass/master.scss

@import '../../../components/bootstrap-sass-official/assets/stylesheets/_bootstrap';

@import '../../acmeuser/sass/master';
@import '../../acmeother/sass/master';
```

### Compilation des feuilles de styles
Enfin, nous en arrivons au point ou nous pouvons parler de la compilation des feuilles de style, c'est à dire la conversion des fichiers Sass en CSS. Pour compiler le Sass, nous utiliserons gulp-sass et le portage de Sass en Node.js 

```bash
npm install --save-dev gulp-sass
```

Etant donné que nous importons tout ce dont nous avons besoin dans notre fichier ``master.scss``, le code de la tâche Gulp est très simple :

```js
// Gulpfile.js

var sass = sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('./web/bundles/front/sass/master.scss')
        .pipe(sass({sourceComments: 'map', errLogToConsole: true}))
        .pipe(gulp.dest('./web/css/'));
});
```

La compilation se fait donc en deux étapes :

Tout d'abord, la publication dans ``web/bundles/``des fichiers par la commande :

```bash
php app/console assets:install --symlink
```

Ensuite, le regroupement de l'ensemble des fichiers issus des Bundles et de Bootstrap dans le fichier ``web/css/master.css``via l'exécution de la commande : 

```bash
gulp sass
```

Dès lors, nous pouvons faire appel à ce fichier css dans notre template de base : 

```twig
<!-- app/Resources/views/base.html.twig -->

<link href="{{ asset('/css/master.css') }}" rel="stylesheet">
```

Tout ce qui concerne les feuilles de style devrait fonctionner maintenant, à l'exception des Glyphicons founirs par Bootstrap.

### Glyphicons
Bootstrap utilise Glyphicons, une *font* d'icônes, qui est référencée dans le dossier ``bootstrap/``. Cependant, les fonts sont situées dans le répertoire ``web/components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/`` et le code CSS dans ``web/css/``. Nous pourrions changer cela, mais nous avons précisé plus tôt que les fonts seront situées dans le répertoire ``web/fonts/`. 

Nous allons donc utiliser le plugin [gulp-copy](https://github.com/klaascuvelier/gulp-copy) qui propose cette fonctionnalité. Une option ``prefix``permet de supprimer les répertoires supperflux du chemin d'origine.

Nous pourrons ensuite éditer notre fichier ``Gulpfile.js`` :

```js
// Gulpfile.js

var copy = copy = require('gulp-copy');

gulp.task('fonts', function () {
    return gulp.src('./web/components/bootstrap-sass-official/assets/fonts/bootstrap/*')
        .pipe(copy('./web/fonts', {prefix: 7}));
});
```

Cependant, le chemin est toujours incorrect, car à la place de ``bootstap/`` il faudrait que nous ayions ``../fonts/``. Heureusement, Bootstrap utilise une variable pour gérer ce chemin et nous pouvons la surcharger en ajoutant une ligne avant d'importer Bootstrap dans notre Sass.

```css
// src/FrontBundle/Resources/public/sass/master.scss

$icon-font-path: '../fonts/';
```

Le lancement de la commande ``gulp fonts sass``exécutera à la fois la tâche ``fonts`` et ``sass``et tout devrait fonctionner.

## Javascript
Nous allons utiliser RequireJS en tant que module et pour charger les fichiers dynamiquement. Le point d'entrée du Javascript sera le fichier ``app.js`` situé dans *FrontBundle*. Chaque Bundle possède son propre ``main.js``qui chargera également les fichiers et modules nécessaires.

### Charger du Javascript en utilisant RequireJS
Le fichier ``app.js`` va également prendre en charge la configuration de jQuery et des plugin jQuery fournis par Bootstrap, car ces derniers ne disposent pas de modules RequireJS définis.

```js
// src/FrontBundle/Resources/public/js/app.js

require.config({
    paths: {
        'bootstrap': '../../bootstrap',
        'jquery': '../../jquery'
    },
    shim: {
        'bootstrap/affix':      { deps: ['jquery'], exports: '$.fn.affix' },
        'bootstrap/alert':      { deps: ['jquery'], exports: '$.fn.alert' },
        'bootstrap/button':     { deps: ['jquery'], exports: '$.fn.button' },
        'bootstrap/carousel':   { deps: ['jquery'], exports: '$.fn.carousel' },
        'bootstrap/collapse':   { deps: ['jquery'], exports: '$.fn.collapse' },
        'bootstrap/dropdown':   { deps: ['jquery'], exports: '$.fn.dropdown' },
        'bootstrap/modal':      { deps: ['jquery'], exports: '$.fn.modal' },
        'bootstrap/popover':    { deps: ['jquery'], exports: '$.fn.popover' },
        'bootstrap/scrollspy':  { deps: ['jquery'], exports: '$.fn.scrollspy' },
        'bootstrap/tab':        { deps: ['jquery'], exports: '$.fn.tab'        },
        'bootstrap/tooltip':    { deps: ['jquery'], exports: '$.fn.tooltip' },
        'bootstrap/transition': { deps: ['jquery'], exports: '$.fn.transition' }
    }
});

require(['main']);
```
La dernière ligne de ce code doit attirer votre attention : elle indique à RequireJS de charger le fichier ``main.js`` situé dans le même répertoire. Notre projet ne contient pas énormément de javascript, mais voici ce que contient le fichier ``main.js``:

```js
// src/FrontBundle/Resources/public/js/main.js

define(function (require) {
    require(['jquery', 'bootstrap/alert'], function() {
        $('.alert').alert();
    });
});
```

Que se passerait il si nous souhaiterions charger du javascript issus d'autres Bundles ? Il suffirait pour cela d'ajouter de nouvelles entrées à l'option ``paths`` du fichier ``app.js``, puis faire appel à celle-ci à la fin de notre fichier :

```js
// src/FrontBundle/Resources/public/js/app.js

require.config({
    paths: {
        // ...
        'user': '../../user/js'
    },
    shim: {
        // ...
    }
});

require(['main', 'user/main']);
```

Le fichier ``main.js``de *UserBundle* peut maintenant faire appel à d'autres modules.

```js
// src/UserBundle/Resources/public/js/main.js

define(function (require) {
    require(['jquery'], function() {
        $('.alert').addClass('hello-world');
    });
});
```

### Compilation du Javascript
Finalement, Gulp ne nous servira pas vraiement à compiler notre Javascript, car RequireJS se charge déjà de les concaténer. Nous nous en servirons pour copier ces fichiers dans le répertoire ``web/js/``.

```js
// Gulpfile.js

gulp.task('js', function() {
    gulp.src([
            './web/bundles/*/js/**/*.js',
            './web/components/bootstrap-sass-official/assets/javascripts/bootstrap/*.js',
            './web/components/jquery/dist/jquery.js',
            './web/components/requirejs/require.js'
        ])
        .pipe(gulp.dest('./web/js'));
});
```

## Surveillance et Rechargement
Il peut être assez fastidieux de relancer les tâches ``sass`` et ``js`` à chaque fois que le les fichiers ``.scss`` et ``.js``sont modifiés. Gulp, comme beaucoups d'outils modernes, intègre une fonctionnalité de *surveillance* (watch), qui automatise le lancement de ces tâches. De plus, nous allons utiliser LiveReload pour automatiquement actualiser notre navigateur à chaque fois qu'une modification sera effectuée.

### Surveillance 

Gulp intègre la fonction ``watch()`` par défault. Nous allons utiliser un expression régulère pour différencier la surveillance des fichiers Sass et Javascript.

```js
// Gulpfile.js

gulp.task('watch', function () {
    var onChange = function (event) {
        console.log('File '+event.path+' has been '+event.type);
    };
    gulp.watch('./src/*/Resources/public/sass/**/*.scss', ['sass'])
        .on('change', onChange);
    gulp.watch('./src/*/Resources/public/js/**/*.js', ['js'])
        .on('change', onChange);
});
```

### Rechargement

Pour pouvoir utiliser LiveReload et actualiser la fenêtre du navigateur à chaque modification de fichier, 
nous allons installer le plugin [gulp-livereload](https://github.com/vohof/gulp-livereload). 
Nous utiliserons un bout de code dans notre template, en mode *dev*. Nous aurions pu installer une extension sur notre navigateur, mais cela nous permet de tout sous contrôle dans notre code source.

Après avoir installé le plugin, nous allons adapter la tâche ``watch``afin d'informer LiveReload que des fichiers ont été modifiés.

```js
// Gulpfile.js

var livereload = require('gulp-livereload');

gulp.task('watch', function () {
    var onChange = function (event) {
        console.log('File '+event.path+' has been '+event.type);
        // Tell LiveReload to reload the window
        livereload.changed();
    };
    // Starts the server
    livereload.listen();
    gulp.watch('./src/*/Resources/public/sass/**/*.scss', ['sass'])
        .on('change', onChange);
    gulp.watch('./src/*/Resources/public/js/**/*.js', ['js'])
        .on('change', onChange);
});
```

Notre layout va tester si nous sommes en environnement de ``dev``pour inclure un bout de code LiveReload :

```twig
// app/Resources/views/base.html.twig

{% if app.environment == 'dev' %}
    <script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
{% endif %}
```
## Lancement de commandes PHP

### PHPUnit
Nous utiliserons le plugin [gulp-phpunit](https://github.com/mikeerickson/gulp-phpunit) pour lancer PHPUnir via Gulp.

```bash 
npm install --save-dev gulp-phpunit
```

Nous allons utiliser la fonction ``task()`` pour créer une tâche que nous appelerons ``test``. La fonction ``src()`` nous permet d'utiliser une expression régulière pour sélectionner les fichiers de test. 

```js
// Gulpfile.js

var phpunit = phpunit = require('gulp-phpunit');

gulp.task('test', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit('./bin/phpunit', {debug: false, configurationFile: './app/phpunit.xml'}));
});
```

Nous pouvons maintenant lancer la tâche ``gulp test``. Le plugin ``gulp-phpunit`` met à notre disposition un grand nombre d'options. Nous allons en profiter pour créer une tâche de génération de rapport de couverture de code.

```js
// Gulpfile.js

gulp.task('coverage', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit(
            './bin/phpunit',
            {debug: false, configurationFile: './app/phpunit.xml', coverageHtml: './build/coverage'}
        ));
});
```
### PHP_CodeSniffer

Nous utiliserons le plugin [gulp-phpcs](https://github.com/JustBlackBird/gulp-phpcs) pour lancer PHP_CodeSniffer via Gulp.

```js
// Gulpfile.js

var phpcs = require('gulp-phpcs');

gulp.task('checkstyle', function () {
    return gulp.src(['src/**/*.php'])
        .pipe(phpcs({bin: './bin/phpcs', standard: 'PSR2', warningSeverity: 0}))
        .pipe(phpcs.reporter('log'));
});
```

Nous allons également créer une tâche ``verify`` en tant que raccourci :

```js
// Gulpfile.js

gulp.task('verify', ['coverage', 'checkstyle']);
```

### Commandes Symfony
Durant les étapes de compilation, nous aurons besoin de lancer des commandes Symfony. Plutôt que d'utiliser un plugin supplémentaire, nous utiliserons le module ``child_process`` fourni avec Node.js et qui nous permet d'exécuter des commandes Shell.

```js
// Gulpfile.js

var exec = require('child_process').exec;

gulp.task('installAssets', function () {
    exec('php app/console assets:install --symlink', logStdOutAndErr);
});

// Without this function exec() will not show any output
var logStdOutAndErr = function (err, stdout, stderr) {
    console.log(stdout + stderr);
};
```
Comme vous le voyez, nous avons créé une tâche Gulp qui lance la commande d'installation des *assets*. Nous pouvons intégrer cette tâche à une autre tâche et nous n'aurions ainsi plus à penser à lancer cette dernière.

### Et maintenant  ?

Nous disposons d'un certain nombre de tâches Gulp qui nous permettent d'accélerer et faciliter notre développement sur Symfony. 
Vous pouvez donc lancer les commandes suivantes :

```bash
# Compiler les fichiers sass, js et fonts
gulp sass js font

# Lancer la commande Symfony pour installer les assets
gulp installAssets 

# Observer les fichiers scss et js pour les compiler et recharger la page de votre navigateur
gulp watch

# Lancer phpUnit et phpcs
gulp verify
```

### Pour tester

Vous retrouverez un projet Symfony en exemple à l'adresse : [https://github.com/acseo/gulp-symfony-tutoriel]()

## Remerciements
Cet article est inspiré et traduit d'un article de Florian Eckerstorfer, accessible en anglais à l'adresse : [https://florian.ec/articles/buliding-symfony2-with-gulp/]()
