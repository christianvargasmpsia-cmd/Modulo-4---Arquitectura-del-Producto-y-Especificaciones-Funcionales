# umss_ecommerce.py - Prototipo simple de UMSS Ecommerce
# Ejecutar con: python umss_ecommerce.py
# No requiere instalación de dependencias.

import uuid  # Para IDs únicos (estándar en Python)

# Datos simulados en memoria
productos = {
    "polera_umss": {"nombre": "Polera UMSS", "precio": 50, "stock": 2},
    "libro_matematicas": {"nombre": "Libro de Matemáticas", "precio": 100, "stock": 5}
}

pedidos = {}  # {id_pedido: {"cliente": str, "productos": list, "total": float, "estado": str, "pago_id": str}}
pagos = {}    # {id_pago: {"monto": float, "usado": bool}}

# Estados de pedido
ESTADOS = ["pendiente", "pagado", "confirmado", "entregado", "cancelado"]

def generar_id():
    return str(uuid.uuid4())[:8]  # ID corto para simplicidad

def menu_principal():
    while True:
        print("\n=== UMSS Ecommerce ===")
        print("1. Emprendedor: Gestionar productos")
        print("2. Cliente: Hacer pedido")
        print("3. Administrador: Ver métricas")
        print("4. Ejecutar caso de prueba")
        print("5. Salir")
        opcion = input("Elige una opción: ")
        
        if opcion == "1":
            menu_emprendedor()
        elif opcion == "2":
            menu_cliente()
        elif opcion == "3":
            menu_administrador()
        elif opcion == "4":
            caso_prueba()
        elif opcion == "5":
            break
        else:
            print("Opción inválida.")

def menu_emprendedor():
    print("\n--- Gestión de Productos ---")
    for id_prod, prod in productos.items():
        print(f"{id_prod}: {prod['nombre']} - Precio: {prod['precio']} Bs, Stock: {prod['stock']}")
    # Simulación básica: No agregar/edición para simplicidad

def menu_cliente():
    print("\n--- Hacer Pedido ---")
    carrito = []
    total = 0
    while True:
        print("Productos disponibles:")
        for id_prod, prod in productos.items():
            print(f"{id_prod}: {prod['nombre']} - {prod['precio']} Bs (Stock: {prod['stock']})")
        prod_id = input("Ingresa ID del producto (o 'fin' para terminar): ")
        if prod_id == "fin":
            break
        if prod_id in productos and productos[prod_id]["stock"] > 0:
            cantidad = int(input("Cantidad: "))
            if cantidad <= productos[prod_id]["stock"]:
                carrito.append({"id": prod_id, "cantidad": cantidad})
                total += productos[prod_id]["precio"] * cantidad
            else:
                print("Stock insuficiente.")
        else:
            print("Producto no válido o sin stock.")
    
    if carrito:
        # Simular pago QR
        print(f"Total a pagar: {total} Bs")
        monto_pagado = float(input("Ingresa monto pagado (simulación QR): "))
        id_pago = generar_id()
        pagos[id_pago] = {"monto": monto_pagado, "usado": False}
        
        # Crear pedido pendiente
        id_pedido = generar_id()
        pedidos[id_pedido] = {
            "cliente": "Cliente Universitario",  # Simulado
            "productos": carrito,
            "total": total,
            "estado": "pendiente",
            "pago_id": id_pago
        }
        
        # Validación crítica
        validar_pedido(id_pedido)
        print(f"Pedido {id_pedido} creado. Estado: {pedidos[id_pedido]['estado']}")

def validar_pedido(id_pedido):
    pedido = pedidos[id_pedido]
    pago = pagos[pedido["pago_id"]]
    
    # Regla 1: No confirmar sin pago
    if pago["monto"] != pedido["total"]:
        pedido["estado"] = "cancelado"
        return
    
    # Regla 2: Monto exacto
    if pago["usado"]:
        pedido["estado"] = "cancelado"  # Evitar duplicados
        return
    pago["usado"] = True
    
    # Regla 3: Verificar stock
    for item in pedido["productos"]:
        prod = productos[item["id"]]
        if prod["stock"] < item["cantidad"]:
            pedido["estado"] = "cancelado"
            return
    
    # Confirmar y descontar stock
    for item in pedido["productos"]:
        prod = productos[item["id"]]
        prod["stock"] -= item["cantidad"]
    
    pedido["estado"] = "confirmado"

def menu_administrador():
    print("\n--- Métricas Globales ---")
    total_pedidos = len(pedidos)
    pedidos_confirmados = sum(1 for p in pedidos.values() if p["estado"] == "confirmado")
    print(f"Total pedidos: {total_pedidos}")
    print(f"Pedidos confirmados: {pedidos_confirmados}")
    print("Productos y stock:")
    for id_prod, prod in productos.items():
        print(f"{prod['nombre']}: Stock {prod['stock']}")

def caso_prueba():
    print("\n--- Caso de Prueba ---")
    # Simular: Producto "Polera UMSS" (precio 50, cantidad 3, stock 2), pago 150 Bs
    carrito = [{"id": "polera_umss", "cantidad": 3}]
    total = 50 * 3  # 150
    id_pago = generar_id()
    pagos[id_pago] = {"monto": 150, "usado": False}
    
    id_pedido = generar_id()
    pedidos[id_pedido] = {
        "cliente": "Cliente Prueba",
        "productos": carrito,
        "total": total,
        "estado": "pendiente",
        "pago_id": id_pago
    }
    
    validar_pedido(id_pedido)
    estado = pedidos[id_pedido]["estado"]
    stock_restante = productos["polera_umss"]["stock"]
    print(f"Resultado: Pedido {id_pedido} - Estado: {estado}, Stock restante: {stock_restante}")
    print("Esperado: Rechazado por stock insuficiente, stock 2.")

if __name__ == "__main__":
    menu_principal()