"""
Script de carga de datos iniciales (Seed) para la ferretería.
Permite poblar la base de datos con categorías, proveedores y productos realistas
para pruebas locales, demostración oral y consumo desde el frontend de JavaScript.
"""

import os
import sys

sys.path.insert(0, os.path.realpath("."))

from sqlmodel import Session, select
from src.database import engine
from src.models.categoria import Categoria
from src.models.producto import Producto
from src.models.proveedor import Proveedor


def seed_database():
    with Session(engine) as session:
        # Verificar si ya existen categorías cargadas
        if session.exec(select(Categoria)).first():
            print("La base de datos ya cuenta con datos iniciales.")
            return

        print("Iniciando carga de datos de ejemplo para la ferretería...")

        # 1. Categorías de ferretería
        cat_manuales = Categoria(
            nombre="Herramientas Manuales",
            descripcion="Martillos, pinzas, destornilladores, serruchos y llaves",
        )
        cat_electricas = Categoria(
            nombre="Herramientas Eléctricas",
            descripcion="Taladros, amoladoras, caladoras, sierras circulares y lijadoras",
        )
        cat_fijaciones = Categoria(
            nombre="Fijaciones y Tornillería",
            descripcion="Tornillos, tarugos, remaches, pernos, tuercas y arandelas",
        )
        cat_pintureria = Categoria(
            nombre="Pinturería y Acabados",
            descripcion="Látex, esmaltes sintéticos, pinceles, rodillos, solventes y selladores",
        )
        cat_plomeria = Categoria(
            nombre="Plomería y Grifería",
            descripcion="Caños termofusión, accesorios PVC, grifería, válvulas y sifones",
        )
        cat_electricidad = Categoria(
            nombre="Electricidad e Iluminación",
            descripcion="Cables normalizados, llaves térmicas, disyuntores, tomas y lámparas LED",
        )

        session.add_all([
            cat_manuales,
            cat_electricas,
            cat_fijaciones,
            cat_pintureria,
            cat_plomeria,
            cat_electricidad,
        ])
        session.commit()

        # 2. Proveedores mayoristas
        prov_stanley = Proveedor(
            nombre="Stanley Black & Decker Argentina",
            cuit="30-50123456-9",
            email="ventas@stanleytools.com.ar",
            telefono="+54 11 4750-1000",
            direccion="Av. Fondo de la Legua 1234, San Isidro, Bs. As.",
        )
        prov_bosch = Proveedor(
            nombre="Robert Bosch Argentina S.A.",
            cuit="30-50234567-8",
            email="contacto@ar.bosch.com",
            telefono="+54 11 4778-5000",
            direccion="Blanco Encalada 250, San Isidro, Bs. As.",
        )
        prov_sinteplast = Proveedor(
            nombre="Sinteplast S.A.",
            cuit="30-50345678-7",
            email="pedidos@sinteplast.com.ar",
            telefono="+54 11 6333-8000",
            direccion="Ruta Panamericana Km 38.5, Garín, Bs. As.",
        )
        prov_schneider = Proveedor(
            nombre="Schneider Electric Argentina",
            cuit="30-50456789-6",
            email="atencion@se.com",
            telefono="+54 11 4118-2000",
            direccion="Av. del Libertador 7202, CABA",
        )
        prov_tigre = Proveedor(
            nombre="Tigre Argentina S.A.",
            cuit="30-50567890-5",
            email="distribuidores@tigre.com.ar",
            telefono="+54 11 4725-7000",
            direccion="Parque Industrial Pilar, Bs. As.",
        )

        session.add_all([
            prov_stanley,
            prov_bosch,
            prov_sinteplast,
            prov_schneider,
            prov_tigre,
        ])
        session.commit()

        # 3. Productos de catálogo con 2 relaciones de clave foránea (categoria_id y proveedor_id)
        productos = [
            Producto(
                nombre="Taladro Percutor Bosch GSB 550 RE 550W",
                codigo_barra="7891009852011",
                descripcion="Taladro con selector de percusión y mandril de 13mm. Incluye empuñadura y tope.",
                precio=98500.0,
                stock=18,
                stock_minimo=4,
                categoria_id=cat_electricas.id,
                proveedor_id=prov_bosch.id,
            ),
            Producto(
                nombre="Amoladora Angular Bosch GWS 700 710W 115mm",
                codigo_barra="7891009852028",
                descripcion="Amoladora compacta de 115mm, diseño ergonómico y guarda de protección.",
                precio=89900.0,
                stock=12,
                stock_minimo=3,
                categoria_id=cat_electricas.id,
                proveedor_id=prov_bosch.id,
            ),
            Producto(
                nombre="Martillo Galponero Stanley Fibra de Vidrio 20oz",
                codigo_barra="7790012345671",
                descripcion="Martillo uña curva con mango de fibra de vidrio anti-vibración.",
                precio=34500.0,
                stock=25,
                stock_minimo=5,
                categoria_id=cat_manuales.id,
                proveedor_id=prov_stanley.id,
            ),
            Producto(
                nombre="Juego de Destornilladores Stanley 6 Piezas",
                codigo_barra="7790012345688",
                descripcion="Set de 3 planos y 3 Phillips de acero cromo vanadio magnetizados.",
                precio=28900.0,
                stock=30,
                stock_minimo=6,
                categoria_id=cat_manuales.id,
                proveedor_id=prov_stanley.id,
            ),
            Producto(
                nombre="Pintura Látex Interior Sinteplast Recuplast 20L",
                codigo_barra="7798001122334",
                descripcion="Pintura al agua antihongos acabado mate de alto poder cubritivo.",
                precio=115000.0,
                stock=15,
                stock_minimo=3,
                categoria_id=cat_pintureria.id,
                proveedor_id=prov_sinteplast.id,
            ),
            Producto(
                nombre="Esmalte Sintético Brillante Sinteplast Negro 1L",
                codigo_barra="7798001122341",
                descripcion="Esmalte anticorrosivo para metales y maderas tanto interior como exterior.",
                precio=19200.0,
                stock=40,
                stock_minimo=8,
                categoria_id=cat_pintureria.id,
                proveedor_id=prov_sinteplast.id,
            ),
            Producto(
                nombre="Tornillo Autoperforante T1 Punta Aguja 100u",
                codigo_barra="7791234567011",
                descripcion="Tornillos para fijación de perfilería de placas de yeso / durlock.",
                precio=8500.0,
                stock=100,
                stock_minimo=20,
                categoria_id=cat_fijaciones.id,
                proveedor_id=prov_stanley.id,
            ),
            Producto(
                nombre="Tarugo Nylon con Tope 8mm con Tornillo 100u",
                codigo_barra="7791234567028",
                descripcion="Tarugos universales para ladrillo macizo y hueco con tornillo fix.",
                precio=12300.0,
                stock=80,
                stock_minimo=15,
                categoria_id=cat_fijaciones.id,
                proveedor_id=prov_stanley.id,
            ),
            Producto(
                nombre="Interruptor Termomagnético Schneider Acti9 2x20A",
                codigo_barra="3606480532104",
                descripcion="Llave térmica bipolar curva C de 4.5kA para riel DIN.",
                precio=24900.0,
                stock=22,
                stock_minimo=5,
                categoria_id=cat_electricidad.id,
                proveedor_id=prov_schneider.id,
            ),
            Producto(
                nombre="Tubo Termofusión Agua Fría/Caliente Tigre 20mm x 4m",
                codigo_barra="7798087654321",
                descripcion="Caño tricapa PN20 para conducción de agua presurizada.",
                precio=16800.0,
                stock=50,
                stock_minimo=10,
                categoria_id=cat_plomeria.id,
                proveedor_id=prov_tigre.id,
            ),
        ]

        session.add_all(productos)
        session.commit()
        print(f"Carga finalizada con éxito: {len(productos)} productos cargados.")


if __name__ == "__main__":
    seed_database()
