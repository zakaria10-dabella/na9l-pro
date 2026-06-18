<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ClientAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $data['email'] = strtolower(trim($data['email']));

        $client = Client::where('email', $data['email'])
            ->first();

        if (!$client || !$client->password || !Hash::check($data['password'], $client->password)) {
            return response()->json([
                'message' => 'Email or password is incorrect.',
            ], 401);
        }

        return response()->json([
            'message' => 'Client connected successfully.',
            'client' => $client,
        ]);
    }

    public function updateProfile(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120', Rule::unique('clients', 'email')->ignore($client->id)],
        ]);
        $data['email'] = strtolower(trim($data['email']));

        $client->update($data);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'client' => $client,
        ]);
    }

    public function updateLocation(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $client->update([
            'current_latitude' => $data['latitude'],
            'current_longitude' => $data['longitude'],
            'location_updated_at' => now(),
        ]);

        return response()->json([
            'client' => $client->refresh(),
        ]);
    }

    public function updatePassword(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'max:120', 'confirmed'],
        ]);

        if (!$client->password || !Hash::check($data['current_password'], $client->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 401);
        }

        $client->update([
            'password' => Hash::make($data['password']),
            'password_plain' => $data['password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
