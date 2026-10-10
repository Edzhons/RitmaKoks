<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'confirmed', Password::min(12)],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Paroles atjaunošanas saite nav derīga.',
            'email.required' => 'Trūkst e-pasta adreses.',
            'email.email' => 'E-pasta adrese nav derīga.',
            'password.required' => 'Lūdzu, izvēlies jaunu paroli.',
            'password.confirmed' => 'Paroles nesakrīt.',
            'password.min' => 'Parolei jābūt vismaz 12 rakstzīmes garai.',
        ];
    }
}
