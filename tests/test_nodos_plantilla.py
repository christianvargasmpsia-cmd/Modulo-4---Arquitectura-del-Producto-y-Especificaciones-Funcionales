"""Comprueba que la plantilla no simule operaciones de negocio exitosas."""

import unittest
import inspect

from poc import nodos


class TestPlantillaNodos(unittest.TestCase):
    def test_nodos_pendientes_fallan_sin_modificar_estado(self):
        funciones = [
            funcion for _, funcion in inspect.getmembers(nodos, inspect.isfunction)
            if funcion.__module__ == nodos.__name__
        ]
        self.assertTrue(funciones)
        for funcion in funciones:
            with self.subTest(nodo=funcion.__name__):
                estado: nodos.Estado = {"entrada": "consulta académica"}
                original = estado.copy()
                with self.assertRaises(NotImplementedError):
                    funcion(estado)
                self.assertEqual(estado, original)
