<?php

use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\AccountAuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ClientAuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DriverController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend connected',
    ]);
});

Route::post('/register', [RegistrationController::class, 'store']);
Route::post('/login', [AccountAuthController::class, 'login']);
Route::post('/admin/login', [AdminController::class, 'login']);
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::put('/admin/profile', [AdminController::class, 'updateProfile']);
Route::put('/admin/password', [AdminController::class, 'updatePassword']);
Route::put('/admin/clients/{client}', [AdminController::class, 'updateClient']);
Route::delete('/admin/clients/{client}', [AdminController::class, 'deleteClient']);
Route::put('/admin/drivers/{driver}', [AdminController::class, 'updateDriver']);
Route::delete('/admin/drivers/{driver}', [AdminController::class, 'deleteDriver']);
Route::put('/admin/bookings/{booking}', [AdminController::class, 'updateBooking']);
Route::delete('/admin/bookings/{booking}', [AdminController::class, 'deleteBooking']);
Route::post('/client-login', [ClientAuthController::class, 'login']);
Route::put('/clients/{client}/profile', [ClientAuthController::class, 'updateProfile']);
Route::put('/clients/{client}/location', [ClientAuthController::class, 'updateLocation']);
Route::put('/clients/{client}/password', [ClientAuthController::class, 'updatePassword']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/clients/{client}/dashboard', [BookingController::class, 'dashboard']);
Route::get('/clients/{client}/active-booking', [BookingController::class, 'active']);
Route::get('/drivers/{driver}/commands', [DriverController::class, 'commands']);
Route::post('/drivers/{driver}/bookings/{booking}/accept', [DriverController::class, 'accept']);
Route::get('/drivers/{driver}/active-booking', [DriverController::class, 'active']);
Route::get('/drivers/{driver}/dashboard', [DriverController::class, 'dashboard']);
Route::put('/drivers/{driver}/location', [DriverController::class, 'updateLocation']);
Route::put('/drivers/{driver}/profile', [DriverController::class, 'updateProfile']);
Route::put('/drivers/{driver}/password', [DriverController::class, 'updatePassword']);
