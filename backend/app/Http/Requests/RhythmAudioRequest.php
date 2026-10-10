<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class RhythmAudioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'audio' => [
                'required',
                File::types(['mp3', 'wav', 'ogg', 'm4a', 'webm'])->max(51200),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'audio.required' => 'Izvēlies dziesmas audio failu.',
            'audio.file' => 'Izvēlētais fails nav derīgs audio fails.',
            'audio.mimes' => 'Atļautie audio formāti ir MP3, WAV, OGG, M4A un WEBM.',
            'audio.extensions' => 'Atļautie audio formāti ir MP3, WAV, OGG, M4A un WEBM.',
            'audio.max' => 'Audio fails nedrīkst būt lielāks par 50 MB.',
        ];
    }
}
