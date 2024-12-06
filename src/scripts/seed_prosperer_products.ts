import {
    createApiKeysWorkflow,
    createInventoryLevelsWorkflow,
    createProductCategoriesWorkflow,
    createProductsWorkflow,
    createRegionsWorkflow,
    createSalesChannelsWorkflow,
    createShippingOptionsWorkflow,
    createShippingProfilesWorkflow,
    createStockLocationsWorkflow,
    createTaxRegionsWorkflow,
    linkSalesChannelsToApiKeyWorkflow,
    linkSalesChannelsToStockLocationWorkflow,
    updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { IStockLocationService } from "@medusajs/types";

export default async function seedDemoData({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
    const storeModuleService = container.resolve(Modules.STORE);
    const stockModuleService: IStockLocationService = container.resolve(Modules.STOCK_LOCATION);

    const locations = await stockModuleService.listStockLocations(undefined, undefined, undefined);

    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    logger.info("Seeding product data...");

    const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
        input: {
            product_categories: [
                {
                    name: "Heat pumps",
                    is_active: true,
                },
                {
                    name: "Pipes",
                    is_active: true,
                },
                {
                    name: "Energy storage",
                    is_active: true,
                },
            ],
        },
    });

    await createProductsWorkflow(container).run({
        input: {
            products: [
                {
                    title: "Airmax³ 12GT R290",
                    category_ids: [categoryResult.find((cat) => cat.name === "Heat pumps").id],
                    description:
                        "Powietrzna inwerterowa pompa ciepła do ogrzewania nowych i modernizowanych budynków - z ekologicznym gospodarstwem domowym R290.",
                    handle: "heat-pump",
                    weight: 400000,
                    status: ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://composable-css-public.s3.eu-central-1.amazonaws.com/mocks/images2/airmax3-5-12-gt.jpeg",
                        },
                    ],
                    options: [
                        {
                            title: "Default",
                            values: ["Default"],
                        },
                    ],
                    variants: [
                        {
                            title: "Default variant",
                            sku: "airmax3-5-12-gt",
                            barcode: "1571",
                            options: {
                                Default: "Default",
                            },
                            prices: [
                                {
                                    amount: 52321,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 48325,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
                {
                    title: "Metrojet rura prefabrykowana",
                    category_ids: [categoryResult.find((cat) => cat.name === "Pipes").id],
                    description:
                        "Metrojet prefabricated pipe - 7 microtubes (10/8mm) for efficient water distribution. Perfect for prefabricated construction projects.",
                    handle: "pipe",
                    weight: 34000,
                    status: ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://composable-css-public.s3.eu-central-1.amazonaws.com/mocks/images2/mt-dbp.jpg",
                        },
                    ],
                    options: [
                        {
                            title: "Diameter",
                            values: ["10/8 mm", "12/10 mm"],
                        },
                    ],
                    variants: [
                        {
                            title: "Metrojet rura prefabrykowana - 7 mikrorur (10/8mm)",
                            sku: "MT-DBP-100738-LR0H",
                            barcode: "1579",
                            ean: "978020137962",
                            options: {
                                Diameter: "10/8 mm",
                            },
                            prices: [
                                {
                                    amount: 39.7,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 36.6,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Metrojet rura prefabrykowana - 7 mikrorur (12/10mm)",
                            sku: "MT-DBP-120744-LR0H",
                            barcode: "1580",
                            ean: "5805554265074",
                            options: {
                                Diameter: "12/10 mm",
                            },
                            prices: [
                                {
                                    amount: 42.2,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 39.6,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
                {
                    title: "BCS125K-B-HM",
                    category_ids: [categoryResult.find((cat) => cat.name === "Energy storage").id],
                    description:
                        "Poznaj najnowocześniejszą wydajność dzięki naszej trzypoziomowej technologii, która pozwala osiągnąć wyjątkową wydajność falownika sięgającą 98,7%. Nasz system oferuje zaawansowane funkcje, takie jak kontrola potencjału punktu środkowego i inteligentne rejestrowanie fali zwarciowej, zapewniając optymalną wydajność. Elastyczna konstrukcja, obejmująca moduł świetlny i połączenie równoległe wielu jednostek, upraszcza instalację i obsługę. Bezproblemowo zintegruj nasze rozwiązanie z systemami BMS i zasilaczami UPS, gwarantując stabilność. Bezproblemowo dostosowuj się do wyzwań związanych z siecią dzięki kontroli wysokiego/niskiego napięcia i współczynnikowi mocy. Wykorzystaj innowację dzięki wbudowanemu ładowaniu wstępnemu prądem stałym, aby zapewnić wygodny dostęp do systemu akumulatorowego. Popraw zarządzanie energią dzięki naszej zaawansowanej, przyjaznej dla użytkownika technologii.",
                    handle: "energy-storage",
                    weight: 4000000,
                    status: ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://composable-css-public.s3.eu-central-1.amazonaws.com/mocks/images2/bcs125k-b-hm_1.png",
                        },
                    ],
                    options: [
                        {
                            title: "Output_power",
                            values: ["100kW", "125kW"],
                        },
                    ],
                    variants: [
                        {
                            title: "BCS125K-B-HM 125kW",
                            sku: "125123",
                            barcode: "39",
                            ean: "4567890123453",
                            options: {
                                Output_power: "125kW",
                            },
                            prices: [
                                {
                                    amount: 2570.7,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 2440.4,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });

    logger.info("Finished seeding product data.");

    logger.info("Seeding inventory levels.");

    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
    });

    console.log(locations[0].id);

    const inventoryLevels = [];
    const filteredItems = inventoryItems.filter((item) =>
        ["airmax3-5-12-gt", "MT-DBP-120744-LR0H", "MT-DBP-100738-LR0H", "125123"].includes(item.sku),
    );
    for (const inventoryItem of filteredItems) {
        const inventoryLevel = {
            location_id: locations[0].id,
            stocked_quantity: 1000000,
            inventory_item_id: inventoryItem.id,
        };
        inventoryLevels.push(inventoryLevel);
    }

    await createInventoryLevelsWorkflow(container).run({
        input: {
            inventory_levels: inventoryLevels,
        },
    });

    logger.info("Finished seeding inventory levels data.");
}
