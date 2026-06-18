<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $client = Client::where('email', $data['email'])->first();

        if ($client && $client->password && Hash::check($data['password'], $client->password)) {
            return response()->json([
                'message' => 'Client connected successfully.',
                'role' => 'client',
                'account' => $client,
            ]);
        }

        $driver = Driver::where('email', $data['email'])->first();

        if ($driver && $driver->password && Hash::check($data['password'], $driver->password)) {
            return response()->json([
                'message' => 'Driver connected successfully.',
                'role' => 'driver',
                'account' => $driver,
            ]);
        }

        return response()->json([
            'message' => 'Email or password is incorrect.',
        ], 401);
    }
}
