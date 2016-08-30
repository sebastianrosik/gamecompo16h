<?php
setcookie("ws", "localhost:8086");
session_name("jetpack");
session_start();

require_once("index.html");
