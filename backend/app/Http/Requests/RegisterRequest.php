<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(12)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Lūdzu, ievadi savu vārdu.',
            'name.max' => 'Vārds nedrīkst būt garāks par 255 rakstzīmēm.',
            'email.required' => 'Lūdzu, ievadi e-pasta adresi.',
            'email.email' => 'Lūdzu, ievadi derīgu e-pasta adresi.',
            'email.unique' => 'Konts ar šo e-pasta adresi jau ir reģistrēts.',
            'password.required' => 'Lūdzu, izvēlies paroli.',
            'password.confirmed' => 'Paroles nesakrīt.',
            'password.min' => 'Parolei jābūt vismaz 12 rakstzīmes garai.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'vārds',
            'email' => 'e-pasta adrese',
            'password' => 'parole',
        ];
    }
}
