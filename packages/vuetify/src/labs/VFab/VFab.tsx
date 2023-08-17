// Styles
import './VFab.sass'

// Components
import { makeVBtnProps, VBtn } from '@/components/VBtn/VBtn'

// Composables
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { makeLocationProps, useLocation } from '@/composables/location'
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { computed, onMounted, ref, shallowRef, toRef, toRefs, watch } from 'vue'
import { useRtl } from '../entry-bundler'
import { convertToUnit, genericComponent, propsFactory, toPhysical, useRender } from '@/util'

// Types
import type { PropType } from 'vue'

const locations = ['start', 'end', 'left', 'right', 'top', 'bottom'] as const

export const makeVFabProps = propsFactory({
  app: Boolean,
  extended: Boolean,
  modelValue: {
    type: Boolean,
    default: true,
  },

  ...makeVBtnProps(),
  ...makeLayoutItemProps(),

  location: {
    type: String as PropType<typeof locations[number]>,
    default: 'bottom',
    validator: (value: any) => locations.includes(value),
  },
}, 'VFab')

export const VFab = genericComponent()({
  name: 'VFab',

  props: makeVFabProps(),

  emits: {
    'update:modelValue': (value: boolean) => true,
  },

  setup (props, { slots }) {
    const isActive = useProxiedModel(props, 'modelValue')
    const { isRtl } = useRtl()
    const { locationStyles } = useLocation(props)

    const height = ref(parseInt(Number(props.height), 10))
    const location = computed(() => {
      return toPhysical(props.location, isRtl.value) as 'left' | 'right' | 'bottom'
    })
    const { layoutItemStyles } = useLayoutItem({
      id: props.name,
      order: computed(() => parseInt(props.order, 10)),
      position: location,
      layoutSize: height,
      elementSize: shallowRef(undefined),
      active: computed(() => props.app && isActive.value),
      absolute: toRef(props, 'absolute'),
    })

    const vFabRef = ref()

    onMounted(() => {
      height.value = vFabRef.value.getBoundingClientRect().height
    })

    watch(() => props.height, val => {
      height.value = parseInt(Number(val), 10)
    })

    useRender(() => {
      const [btnProps] = VBtn.filterProps(props)

      return (
        <div
          ref={ vFabRef }
          class={[
            'v-fab',
            {
              'v-fab--extended': props.extended,
            },
            props.class,
          ]}
          style={[
            props.app ? {
              ...layoutItemStyles.value,
              ...locationStyles.value,
            } : {
              height: convertToUnit(props.height),
            },
            props.style,
          ]}
        >
          <VBtn
            { ...btnProps }
            location={ undefined }
            v-slots={ slots }
          />
        </div>
      )
    })

    return {}
  },
})
