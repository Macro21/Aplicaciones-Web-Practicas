-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-12-2017 a las 20:52:42
-- Versión del servidor: 10.1.28-MariaDB
-- Versión de PHP: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facebluff`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `answer`
--

CREATE TABLE `answer` (
  `id` int(11) NOT NULL,
  `idQuestion` int(11) DEFAULT NULL,
  `answer` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `userEmail` varchar(100) NOT NULL,
  `petitionerEmail` varchar(100) NOT NULL,
  `state` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `galery`
--

CREATE TABLE `galery` (
  `email` varchar(100) NOT NULL,
  `image` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guessedanswer`
--

CREATE TABLE `guessedanswer` (
  `userEmail` varchar(100) NOT NULL,
  `friendEmail` varchar(100) NOT NULL,
  `idQuestion` int(11) NOT NULL,
  `guessed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `question`
--

CREATE TABLE `question` (
  `id` int(11) NOT NULL,
  `question` varchar(100) NOT NULL,
  `nAnswer` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `email` varchar(100) NOT NULL,
  `password` varchar(30) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `gender` char(1) NOT NULL,
  `birthdate` date NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `score` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `useranswer`
--

CREATE TABLE `useranswer` (
  `userEmail` varchar(100) NOT NULL,
  `idAnswer` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `answer`
--
ALTER TABLE `answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idQuestion` (`idQuestion`);

--
-- Indices de la tabla `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`userEmail`,`petitionerEmail`),
  ADD KEY `petitionerEmail` (`petitionerEmail`);

--
-- Indices de la tabla `galery`
--
ALTER TABLE `galery`
  ADD PRIMARY KEY (`email`,`image`);

--
-- Indices de la tabla `guessedanswer`
--
ALTER TABLE `guessedanswer`
  ADD PRIMARY KEY (`userEmail`,`friendEmail`,`idQuestion`),
  ADD KEY `idQuestion` (`idQuestion`),
  ADD KEY `friendEmail` (`friendEmail`);

--
-- Indices de la tabla `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `useranswer`
--
ALTER TABLE `useranswer`
  ADD PRIMARY KEY (`userEmail`,`idAnswer`),
  ADD KEY `idAnswer` (`idAnswer`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `answer`
--
ALTER TABLE `answer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `question`
--
ALTER TABLE `question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `answer_ibfk_1` FOREIGN KEY (`idQuestion`) REFERENCES `question` (`id`);

--
-- Filtros para la tabla `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`userEmail`) REFERENCES `user` (`email`),
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`petitionerEmail`) REFERENCES `user` (`email`);

--
-- Filtros para la tabla `galery`
--
ALTER TABLE `galery`
  ADD CONSTRAINT `galery_ibfk_1` FOREIGN KEY (`email`) REFERENCES `user` (`email`);

--
-- Filtros para la tabla `guessedanswer`
--
ALTER TABLE `guessedanswer`
  ADD CONSTRAINT `guessedanswer_ibfk_1` FOREIGN KEY (`idQuestion`) REFERENCES `question` (`id`),
  ADD CONSTRAINT `guessedanswer_ibfk_2` FOREIGN KEY (`userEmail`) REFERENCES `user` (`email`),
  ADD CONSTRAINT `guessedanswer_ibfk_3` FOREIGN KEY (`friendEmail`) REFERENCES `user` (`email`);

--
-- Filtros para la tabla `useranswer`
--
ALTER TABLE `useranswer`
  ADD CONSTRAINT `useranswer_ibfk_1` FOREIGN KEY (`userEmail`) REFERENCES `user` (`email`),
  ADD CONSTRAINT `useranswer_ibfk_2` FOREIGN KEY (`idAnswer`) REFERENCES `answer` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
