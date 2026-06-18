<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RegistrationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120'],
            'password' => ['required', 'string', 'min:6', 'max:120'],
            'role' => ['required', Rule::in(['client', 'driver'])],
            'vehicle_number' => ['required_if:role,driver', 'nullable', 'string', 'max:60'],
            'vehicle_category' => ['required_if:role,driver', 'nullable', Rule::in(['A', 'B', 'C'])],
        ]);

        if ($data['role'] === 'client') {
            $request->validate([
                'email' => ['unique:clients,email'],
            ]);

            $client = Client::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'password_plain' => $data['password'],
            ]);

            return response()->json([
                'message' => 'Client saved successfully.',
                'role' => 'client',
                'client' => $client,
            ], 201);
        }

        $request->validate([
            'email' => ['unique:drivers,email'],
        ]);

        $driver = Driver::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'password_plain' => $data['password'],
            'vehicle_number' => $data['vehicle_number'],
            'vehicle_category' => $data['vehicle_category'],
        ]);

        return response()->json([
            'message' => 'Driver saved successfully.',
            'role' => 'driver',
            'driver' => $driver,
        ], 201);
    }
}
