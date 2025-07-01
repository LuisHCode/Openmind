<?php
namespace App\controllers;

class ServicioCURL
{
    private const URL = "http://omweb_datos/api";

    public function ejecutarCURL($endPoint, $metodo, $datos = null)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, self::URL . $endPoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        if ($datos !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $datos);
        }

        switch ($metodo) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                break;
            case 'PUT':
            case 'PATCH':
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);
                break;
        }

        $resp = curl_exec($ch);
        $error = curl_error($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($resp === false) {
            $resp = json_encode(['error' => 'Fallo CURL: ' . $error]);
            $status = 500;
        }

        return ['resp' => $resp, 'status' => $status];
    }

}