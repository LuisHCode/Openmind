<?php

use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

$container = new Container();

AppFactory::SetContainer($container);

$app = AppFactory::create();

require 'config.php';

require 'conexion.php';
require 'routes.php';

$app->run();