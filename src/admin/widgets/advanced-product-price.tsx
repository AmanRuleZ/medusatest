import {defineWidgetConfig} from "@medusajs/admin-sdk"
import {AdminProduct, DetailWidgetProps} from "@medusajs/framework/types"
import {useEffect, useState} from "react"
import {Button, Container, Heading, Input, Label, Tooltip} from "@medusajs/ui"
import {InformationCircle} from "@medusajs/icons"

import {Controller, useForm} from "react-hook-form"

const AdvancedPriceWidget = ({
                                 data,
                             }: DetailWidgetProps<AdminProduct>) => {
    const [advancedPrice, setAdvancedPrice] = useState<Record<string, any> | undefined>()
    const [loading, setLoading] = useState(true)
    const [isChanged, setIsChanged] = useState(false)

    const {control, handleSubmit, watch} = useForm()

    useEffect(() => {
        if (!loading) {
            return
        }

        fetch(`/admin/products/${data.id}?fields=advanced_product_price.*`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then(({product}) => {
                setAdvancedPrice(product.advanced_product_price)
                setLoading(false)
            })
    }, [loading, data.id])

    useEffect(() => {
        const subscription = watch((value, {name}) => {
            if (["listPrice", "msrp", "msp"].includes(name!)) {
                setIsChanged(value[name] !== advancedPrice?.[name]);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, advancedPrice]);

    const onSubmit = async (formData) => {
        await fetch(`/admin/products/${data.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                additional_data: {
                    listPrice: formData.listPrice,
                    msrp: formData.msrp,
                    msp: formData.msp
                }
            }),
        })
        setLoading(true)
        setIsChanged(false)
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Advanced product price</Heading>
            </div>
            {loading ? (
                <div className="px-6 py-4">Ładowanie...</div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
                    <Controller
                        name="listPrice"
                        control={control}
                        defaultValue={advancedPrice?.listPrice || ""}
                        render={({field}) => (
                            <div className="flex justify-between items-center mb-2">
                                <Label htmlFor="listPrice" className="mr-2">List price</Label>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        )}
                    />
                    <Controller
                        name="msrp"
                        control={control}
                        defaultValue={advancedPrice?.msrp || ""}
                        render={({field}) => (
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <Label htmlFor="msrp" className="mr-2">MSRP</Label>
                                    <Tooltip content="Manufacturer's suggested retail price">
                                        <InformationCircle className="text-gray-400 cursor-help"/>
                                    </Tooltip>
                                </div>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        )}
                    />
                    <Controller
                        name="msp"
                        control={control}
                        defaultValue={advancedPrice?.msp || ""}
                        render={({field}) => (
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <Label htmlFor="msp" className="mr-2">MSP</Label>
                                    <Tooltip content="Minimum selling price">
                                        <InformationCircle className="text-gray-400 cursor-help"/>
                                    </Tooltip>
                                </div>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={!isChanged}
                        className="mt-4"
                    >
                        Zapisz zmiany
                    </Button>
                </form>
            )}
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.before",
})

export default AdvancedPriceWidget