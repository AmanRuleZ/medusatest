import {defineWidgetConfig} from "@medusajs/admin-sdk"
import {AdminProduct, DetailWidgetProps} from "@medusajs/framework/types"
import {useEffect, useState} from "react"
import {Button, Container, Heading, Switch} from "@medusajs/ui"
import {Controller, useForm} from "react-hook-form"

const ProductOutletWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
    const [outlet, setOutlet] = useState<Record<string, any> | undefined>()
    const [loading, setLoading] = useState(true)
    const [isChanged, setIsChanged] = useState(false)

    const {control, handleSubmit, watch} = useForm()

    useEffect(() => {
        if (!loading) {
            return
        }

        fetch(`/admin/products/${data.id}?fields=outlet.*`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then(({product}) => {
                setOutlet(product.outlet)
                setLoading(false)
            })
    }, [loading])

    useEffect(() => {
        const subscription = watch((value, {name, type}) => {
            if (name === "is_outlet") {
                setIsChanged(value.is_outlet !== outlet?.is_outlet)
            }
        })
        return () => subscription.unsubscribe()
    }, [watch, outlet])

    const onSubmit = async (formData) => {
        await fetch(`/admin/products/${data.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                additional_data: {
                    is_outlet: formData.is_outlet
                }
            }),
        })
        setLoading(true)
        setIsChanged(false)
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-x-4">
                    <Heading level="h2">Outlet</Heading>
                    {loading && <span>Loading...</span>}
                    {!loading && (
                        <form onSubmit={handleSubmit(onSubmit)}
                              className="flex items-center gap-x-10"
                        >
                            <Controller
                                name="is_outlet"
                                control={control}
                                defaultValue={outlet?.is_outlet || false}
                                render={({field: {onChange, value}}) => (
                                    <Switch
                                        checked={value}
                                        onCheckedChange={onChange}
                                    />
                                )}
                            />
                            <Button type="submit" disabled={!isChanged}>Save</Button>
                        </form>
                    )}
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.before",
})

export default ProductOutletWidget