-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2024 at 07:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `intank`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `prodId` int(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `qty` int(255) NOT NULL,
  `type` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`prodId`, `email`, `qty`, `type`) VALUES
(4, 'catfish@gmail.com', 100, 0);

-- --------------------------------------------------------

--
-- Table structure for table `image`
--

CREATE TABLE `image` (
  `imgId` int(11) NOT NULL,
  `imgName` varchar(255) NOT NULL,
  `prodId` int(20) NOT NULL,
  `main` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `image`
--

INSERT INTO `image` (`imgId`, `imgName`, `prodId`, `main`) VALUES
(1, 'bettaglory.png', 4, 1),
(2, 'filter.jpg', 2, 1),
(3, 'xiaomi1.png', 1, 1),
(4, 'quick-start.jpg', 3, 1),
(5, 'soil.png', 5, 1),
(6, 'fishtank.jpg', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ordId` int(255) NOT NULL,
  `prodId` int(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ordDate` date NOT NULL DEFAULT current_timestamp(),
  `status` varchar(255) NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `prodId` int(20) NOT NULL,
  `prodName` varchar(255) NOT NULL,
  `prodDesc` text DEFAULT NULL,
  `price` decimal(20,2) NOT NULL,
  `stock` int(20) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`prodId`, `prodName`, `prodDesc`, `price`, `stock`, `type`) VALUES
(1, 'Fish Tank', 'Fish tank', 50.00, 10, 'Tank'),
(2, 'Yee Filter', 'A standard Hang-on-back filter that can purify the water, also acts as a fountain to increase surface agitation to increase oxygen level for your fishes.', 29.90, 50, 'equipment'),
(3, 'API - Quick Start', 'API - Quick Start contains nitrifying bacteria that allows the instant addition of fish, as it immediately starts the natural aquarium cycle with beneficial bacteria, which converts toxic ammonia into nitrite, then into harmless nitrate to help prevent fish loss in your tank. Best for use when starting a new aquarium, after water changes and filter changes, and when adding new fish to an existing aquarium. API QUICK START nitrifying bacteria may be used in both fresh and saltwater aquariums.', 9.99, 30, 'equipment'),
(4, 'Dymax - Betta Glory Slow Sinking Granules 10g', 'Contains astaxanthin to improve body color\r\nBetta GLORY has been developed after considerable research of the GLORY fish’s eating habits and its nutritional requirements. This includes premium selected fish meal that provides superior protein source, Astaxanthin which helps enhance GLORY coloration, immunostimulants like B-Glucan and other premium nutrients to process as a daily diet for all Betta GLORY.', 4.00, 50, 'Food'),
(5, 'Premium Aquarium Soil(1kg)', 'Soil', 15.00, 30, 'Scape');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `pImg` varchar(255) DEFAULT NULL,
  `wallet` decimal(20,2) NOT NULL DEFAULT 0.00,
  `role` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `username`, `password`, `pImg`, `wallet`, `role`) VALUES
('admin@gmail.com', 'Admin', '5611c5a73627cb6182d48685ef63d488cffe836c', NULL, 0.00, 1),
('catfish@gmail.com', 'Glass Cat', 'e6b6db828bc561f68e911e90f539aa998ea34898', 'glasscatfish.jpg', 0.00, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`imgId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ordId`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`prodId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `image`
--
ALTER TABLE `image`
  MODIFY `imgId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `prodId` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
